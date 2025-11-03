import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/context/AuthContext';
import { useLectures } from '@/context/LectureContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  BarChart3,
  Book,
  PlusCircle,
  Users,
  Settings,
  Save,
  Eye,
  Check,
  Trash2,
  GitBranchPlus,
  ArrowRight
} from 'lucide-react';
import { QuizQuestion, Simulation, SimulationStep } from '@shared/schema';
import { nanoid } from 'nanoid';

const categories = [
  'mathematics',
  'science',
  'programming',
  'language',
  'art',
  'biology',
  'geography',
  'economics',
  'other'
];

export default function CreateLecture() {
  const { userProfile } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/admin/edit/:id');
  const { createLecture, updateLecture, fetchLectureById } = useLectures();
  const { toast } = useToast();
  const isEditing = Boolean(match && params?.id);

  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    author: string;
    content: string;
    published: boolean;
    featured: boolean;
    allowComments: boolean;
    quiz: QuizQuestion[];
    simulation: Simulation | undefined;
    cardImageUrl?: string;
    cardDescription?: string;
    earthquakeMiniGame?: boolean;
    floodingMiniGame?: boolean;
  }>({
    title: '',
    category: '',
    author: userProfile?.name || '',
    content: '',
    published: false,
    featured: false,
    allowComments: true,
    quiz: [],
    simulation: undefined,
    cardImageUrl: '',
    cardDescription: '',
    earthquakeMiniGame: false,
    floodingMiniGame: false,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (userProfile?.role !== 'teacher') {
      setLocation('/');
      return;
    }
    
    if (userProfile?.name) {
      setFormData(prev => ({ ...prev, author: userProfile.name }));
    }

    if (isEditing && params?.id) {
      loadLectureForEdit(params.id);
    }
  }, [userProfile, isEditing, params?.id]);

  async function loadLectureForEdit(id: string) {
    try {
      const lecture = await fetchLectureById(id);
      if (lecture) {
        setFormData({
          title: lecture.title,
          category: lecture.category,
          author: lecture.author,
          content: lecture.content,
          published: lecture.published,
          featured: lecture.featured,
          allowComments: lecture.allowComments,
          quiz: lecture.quiz || [],
          simulation: lecture.simulation || undefined,
          cardImageUrl: lecture.cardImageUrl || '',
          cardDescription: lecture.cardDescription || '',
          earthquakeMiniGame: lecture.earthquakeMiniGame || false,
          floodingMiniGame: lecture.floodingMiniGame || false,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lecture for editing.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  }

  // --- Quiz Handlers ---
  const handleQuizChange = (index: number, updatedQuestion: QuizQuestion) => {
    const newQuiz = [...formData.quiz];
    newQuiz[index] = updatedQuestion;
    setFormData(prev => ({ ...prev, quiz: newQuiz }));
  };

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      quiz: [...prev.quiz, { id: nanoid(), question: '', options: ['', '', '', ''], correctAnswer: 0 }]
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quiz: prev.quiz.filter((_, i) => i !== index)
    }));
  };

  // --- Simulation Handlers ---
  const handleAddSimulation = () => {
    const startStepId = nanoid();
    setFormData(prev => ({
      ...prev,
      simulation: {
        startStepId: startStepId,
        steps: [{ id: startStepId, scenario: '', choices: [] }]
      }
    }));
  };
  
  const handleRemoveSimulation = () => {
    setFormData(prev => ({ ...prev, simulation: undefined }));
  };

  const handleSimulationChange = (updatedSimulation: Simulation) => {
    setFormData(prev => ({ ...prev, simulation: updatedSimulation }));
  };

  const handleAddStep = () => {
    if (!formData.simulation) return;
    const newStep: SimulationStep = { id: nanoid(), scenario: '', choices: [] };
    handleSimulationChange({
      ...formData.simulation,
      steps: [...formData.simulation.steps, newStep]
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!formData.simulation) return;
    const newSim = { ...formData.simulation };

    // filter out the step to be removed
    newSim.steps = newSim.steps.filter(step => step.id !== stepId);

    // remove choices in other steps that point to the deleted step
    newSim.steps.forEach(step => {
      step.choices = step.choices.filter(choice => choice.nextStepId !== stepId);
    });

    // if we deleted the start step, reset the simulation
    if (newSim.startStepId === stepId) {
      handleRemoveSimulation();
    } else {
      handleSimulationChange(newSim);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.category || !formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const lectureData = { ...formData, published: isDraft ? false : formData.published };

      if (isEditing && params?.id) {
        await updateLecture(params.id, lectureData);
        toast({ title: "Success", description: "Lecture updated successfully!" });
      } else {
        await createLecture(lectureData);
        toast({ title: "Success", description: "Lecture created successfully!" });
      }
      
      setLocation('/admin');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save lecture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userProfile?.role !== 'teacher') return null;

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <aside className="w-64 bg-card border-r border-border min-h-screen">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-1">Admin Panel</h2>
            </div>
          </aside>
          <main className="flex-1 p-8">
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading lecture...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-1" data-testid="text-panel-title">
              Admin Panel
            </h2>
            <p className="text-sm text-muted-foreground" data-testid="text-welcome">
              Welcome, {userProfile?.name}
            </p>
          </div>
          <nav className="px-3">
            <Link href="/admin"><a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground"><BarChart3 className="w-5 h-5 mr-3" />Dashboard</a></Link>
            <Link href="/admin/lectures"><a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground"><Book className="w-5 h-5 mr-3" />All Lectures</a></Link>
            <Link href="/admin/create"><a className="admin-sidebar-link active flex items-center px-3 py-3 rounded-md mb-1 text-sm"><PlusCircle className="w-5 h-5 mr-3" />{isEditing ? 'Edit Lecture' : 'Create Lecture'}</a></Link>
            <Link href="/admin/students"><a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground"><Users className="w-5 h-5 mr-3" />Students</a></Link>
            <Link href="/admin/settings"><a className="admin-sidebar-link flex items-center px-3 py-3 rounded-md mb-1 text-sm text-muted-foreground"><Settings className="w-5 h-5 mr-3" />Settings</a></Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{isEditing ? 'Edit Lecture' : 'Create New Lecture'}</h1>
            <p className="text-muted-foreground">{isEditing ? 'Make changes to your existing lecture' : 'Fill in the details below to create a new lecture'}</p>
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
            {/* Title Input */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <Label htmlFor="lecture-title" className="block text-sm font-medium text-foreground mb-2">
                Lecture Title <span className="text-destructive">*</span>
              </Label>
              <Input
                type="text"
                id="lecture-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg"
                placeholder="e.g., Introduction to Quantum Physics"
                required
                data-testid="input-title"
              />
            </div>
            {/* Card Display Options */}
            <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Card Display</h3>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="card-image-url" className="block text-sm font-medium text-foreground mb-2">
                        Card Image URL
                        </Label>
                        <Input
                        type="text"
                        id="card-image-url"
                        value={formData.cardImageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardImageUrl: e.target.value }))}
                        placeholder="https://example.com/image.png"
                        />
                    </div>
                    <div>
                        <Label htmlFor="card-description" className="block text-sm font-medium text-foreground mb-2">
                        Card Description
                        </Label>
                        <Textarea
                        id="card-description"
                        value={formData.cardDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, cardDescription: e.target.value }))}
                        placeholder="A brief summary that will appear on the lecture card."
                        />
                    </div>
                </div>
            </div>

            {/* Category and Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg shadow-md p-6">
                <Label className="block text-sm font-medium text-foreground mb-2">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="capitalize">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-card rounded-lg shadow-md p-6">
                <Label htmlFor="author" className="block text-sm font-medium text-foreground mb-2">
                  Author Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="text"
                  id="author"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Your name"
                  required
                  data-testid="input-author"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <Label className="block text-sm font-medium text-foreground mb-4">
                Lecture Content <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                value={formData.content}
                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                placeholder="Start writing your lecture content here..."
              />
              <p className="text-xs text-muted-foreground mt-2">
                <span className="inline-flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Use the toolbar above to format your content. You can add headings, lists, images, and more.
                </span>
              </p>
            </div>
            
            {/* Quiz Builder */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quiz Builder</h3>
              {formData.quiz.map((q, qIndex) => (
                <div key={q.id || qIndex} className="border border-border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-md font-medium">Question {qIndex + 1}</Label>
                    <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Enter your question"
                    value={q.question}
                    onChange={(e) => handleQuizChange(qIndex, { ...q, question: e.target.value })}
                    className="mb-4"
                  />
                  <RadioGroup
                    value={q.correctAnswer.toString()}
                    onValueChange={(value) => handleQuizChange(qIndex, { ...q, correctAnswer: parseInt(value) })}
                  >
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2 mb-2">
                        <RadioGroupItem value={oIndex.toString()} id={`${q.id}-opt-${oIndex}`} />
                        <Input
                          placeholder={`Option ${oIndex + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIndex] = e.target.value;
                            handleQuizChange(qIndex, { ...q, options: newOptions });
                          }}
                        />
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addQuestion}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>

            {/* Simulation Builder */}
            <div className="bg-card rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Simulation Builder</h3>
                {formData.simulation && <Button variant="destructive" size="sm" onClick={handleRemoveSimulation}><Trash2 className="w-4 h-4 mr-2" />Remove Simulation</Button>}
              </div>
              {!formData.simulation ? (
                <Button type="button" variant="outline" onClick={handleAddSimulation}><GitBranchPlus className="w-4 h-4 mr-2" />Add Simulation</Button>
              ) : (
                <div className="space-y-6">
                  {formData.simulation.steps.map((step, stepIndex) => (
                    <div key={step.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-md font-medium">Step {stepIndex + 1} {formData.simulation?.startStepId === step.id && <span className="text-xs font-normal text-primary ml-2">(Start)</span>}</Label>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveStep(step.id)} disabled={formData.simulation?.startStepId === step.id}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                      <Textarea
                        placeholder="Enter the scenario description for this step..."
                        value={step.scenario}
                        onChange={(e) => {
                          const newSteps = [...formData.simulation!.steps];
                          newSteps[stepIndex].scenario = e.target.value;
                          handleSimulationChange({ ...formData.simulation!, steps: newSteps });
                        }}
                      />
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Choices</Label>
                        <div className="space-y-3 mt-2">
                          {step.choices.map((choice, choiceIndex) => (
                             <div key={choice.id} className="flex items-center gap-2">
                               <Input
                                 placeholder={`Choice ${choiceIndex + 1} text`}
                                 value={choice.text}
                                 onChange={(e) => {
                                   const newSteps = [...formData.simulation!.steps];
                                   newSteps[stepIndex].choices[choiceIndex].text = e.target.value;
                                   handleSimulationChange({ ...formData.simulation!, steps: newSteps });
                                 }}
                               />
                               <ArrowRight className="w-4 h-4 text-muted-foreground" />
                               <Select
                                 value={choice.nextStepId || "end"}
                                 onValueChange={(value) => {
                                   const newSteps = [...formData.simulation!.steps];
                                   newSteps[stepIndex].choices[choiceIndex].nextStepId = value === "end" ? null : value;
                                   handleSimulationChange({ ...formData.simulation!, steps: newSteps });
                                 }}
                               >
                                 <SelectTrigger className="w-[200px]"><SelectValue placeholder="Next Step" /></SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="end">End Simulation</SelectItem>
                                   {formData.simulation?.steps.map((s, i) => s.id !== step.id && <SelectItem key={s.id} value={s.id}>Step {i + 1}</SelectItem>)}
                                 </SelectContent>
                               </Select>
                               <Button variant="ghost" size="icon" onClick={() => {
                                 const newSteps = [...formData.simulation!.steps];
                                 newSteps[stepIndex].choices.splice(choiceIndex, 1);
                                 handleSimulationChange({ ...formData.simulation!, steps: newSteps });
                               }}><Trash2 className="w-4 h-4 text-destructive/70" /></Button>
                             </div>
                          ))}
                           <Button type="button" variant="outline" size="sm" onClick={() => {
                              const newSteps = [...formData.simulation!.steps];
                              newSteps[stepIndex].choices.push({ id: nanoid(), text: '', nextStepId: null });
                              handleSimulationChange({ ...formData.simulation!, steps: newSteps });
                           }}><PlusCircle className="w-4 h-4 mr-2" />Add Choice</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={handleAddStep}><GitBranchPlus className="w-4 h-4 mr-2" />Add New Step</Button>
                </div>
              )}
            </div>

             {/* Additional Settings */}
            <div className="bg-card rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Additional Settings</h3>
                <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: !!checked }))}
                    data-testid="checkbox-published"
                    />
                    <Label htmlFor="published" className="text-sm text-foreground">
                    Publish immediately
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                    data-testid="checkbox-featured"
                    />
                    <Label htmlFor="featured" className="text-sm text-foreground">
                    Featured lecture
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="allowComments"
                    checked={formData.allowComments}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowComments: !!checked }))}
                    data-testid="checkbox-comments"
                    />
                    <Label htmlFor="allowComments" className="text-sm text-foreground">
                    Allow comments
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="earthquakeMiniGame"
                    checked={formData.earthquakeMiniGame}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, earthquakeMiniGame: !!checked }))}
                    data-testid="checkbox-earthquake"
                    />
                    <Label htmlFor="earthquakeMiniGame" className="text-sm text-foreground">
                    Enable Earthquake Mini-Game
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox
                    id="floodingMiniGame"
                    checked={formData.floodingMiniGame}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, floodingMiniGame: !!checked }))}
                    data-testid="checkbox-flooding"
                    />
                    <Label htmlFor="floodingMiniGame" className="text-sm text-foreground">
                    Enable Flooding Mini-Game
                    </Label>
                </div>
                </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-end bg-card rounded-lg shadow-md p-6">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                data-testid="button-save-draft"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                data-testid="button-preview"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={loading}
                data-testid="button-publish"
              >
                <Check className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : (isEditing ? 'Update Lecture' : 'Publish Lecture')}
              </Button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}