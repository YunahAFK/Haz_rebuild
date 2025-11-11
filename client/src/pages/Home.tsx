import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { LectureCard } from '@/components/LectureCard';
import { MockLectureCard } from '@/components/MockLectureCard';
import { VolcanoMockCard } from '@/components/VolcanoMockCard';
import { HydroMockCard } from '@/components/HydroMockCard';
import { useLectures } from '@/context/LectureContext';
import { useAuth } from '@/context/AuthContext';
import { Lecture } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import Landing from './Landing';


export default function Home() {
  const { userProfile, loading: authLoading } = useAuth();
  const { lectures, loading, fetchLectures } = useLectures();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredLectures, setFilteredLectures] = useState<(Lecture | null | 'volcano' | 'hydro')[]>([]);
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [isBrowsingLectures, setIsBrowsingLectures] = useState(() => new URLSearchParams(window.location.search).get('browse') === '1');

  useEffect(() => {
    fetchLectures();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setIsBrowsingLectures(params.get('browse') === '1');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect students to their dashboard only if logged in
  useEffect(() => {
    if (userProfile?.role === 'student') {
      setLocation('/student/dashboard');
    }
  }, [userProfile]);

  useEffect(() => {
    let filtered = lectures.filter(lecture => lecture.published);

    if (searchTerm) {
      filtered = filtered.filter(lecture =>
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lecture => lecture.category === selectedCategory);
    }

    // Sort featured lectures to the top
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

    // Define mock lectures data
    const mockLectures = [
      { type: 'volcano', title: 'VOLCANO-RELATED HAZARDS', category: 'science', description: 'Learn about volcano hazards, preparedness, and safety measures to protect yourself and your community.' },
      { type: 'hydro', title: 'HYDROMETEOROLOGICAL HAZARDS', category: 'science', description: 'Learn about hydrometeorological hazards including floods, storms, hurricanes, and other weather-related disasters to enhance preparedness and safety.' },
      { type: 'mock', title: 'EARTHQUAKE HAZARDS', category: 'science', description: 'Learn about earthquake hazards, preparedness, and safety measures to protect yourself and your community.' }
    ];

    // Filter mock lectures based on search term and category
    let filteredMocks: ('volcano' | 'hydro' | null)[] = [];
    if (!searchTerm && selectedCategory === 'all') {
      // Show all mocks when no filters
      filteredMocks = ['volcano', 'hydro', null];
    } else {
      // Filter mocks based on search and category
      filteredMocks = mockLectures
        .filter(mock => {
          const matchesSearch = !searchTerm ||
            mock.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mock.description.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesCategory = selectedCategory === 'all' || mock.category === selectedCategory;
          return matchesSearch && matchesCategory;
        })
        .map(mock => mock.type === 'mock' ? null : (mock.type as 'volcano' | 'hydro'));
    }

    // Add filtered mock cards at the beginning
    setFilteredLectures([...filteredMocks, ...filtered]);
  }, [lectures, searchTerm, selectedCategory]);

  const categories = Array.from(new Set(lectures.map(lecture => lecture.category)));

  // Generate suggestions from lecture titles, categories, and mock data
  const suggestions = useMemo(() => {
    const allSuggestions = new Set<string>();

    // Add lecture titles (only published lectures)
    lectures.filter(lecture => lecture.published).forEach(lecture => {
      allSuggestions.add(lecture.title);
    });

    // Add categories
    categories.forEach(category => {
      allSuggestions.add(category);
    });

    // Add mock lecture titles
    const mockLectures = [
      'VOLCANO-RELATED HAZARDS',
      'HYDROMETEOROLOGICAL HAZARDS',
      'EARTHQUAKE HAZARDS'
    ];
    mockLectures.forEach(title => {
      allSuggestions.add(title);
    });

    return Array.from(allSuggestions);
  }, [lectures, categories]);

  // Filter suggestions based on search term
  const filteredSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
  }, [suggestions, searchTerm]);

  // Show landing page if not authenticated and not browsing lectures
  if (!authLoading && !userProfile && !isBrowsingLectures) {
    return <Landing setIsBrowsingLectures={setIsBrowsingLectures} />;
  }

  if (loading) {
    return (
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-5">
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5">

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
          
        {/* Floating Orbs */}
        <div className="orb orb1"></div>
        <div className="orb orb2"></div>
        <div className="orb orb3"></div>
        <div className="orb orb4"></div>
        <div className="orb orb5"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Search and Filter Bar with Header */}
        <Card className="mb-8 p-6 bg-cover bg-center relative" style={{ backgroundImage: "url('https://i.postimg.cc/3JMKQ1x3/cozylibrary-bg.jpg')" }}>
          <div className="absolute inset-0 bg-primary bg-opacity-80 rounded-lg"></div>
          <div className="relative mb-6">
            <h2 className="text-3xl font-bold text-white mb-2" data-testid="text-page-title">
              Lectures
            </h2>
            <p className="text-white" data-testid="text-page-description">
              Explore our comprehensive collection of learning materials
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search lectures..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setOpen(e.target.value.length >= 2);
                      }}
                      onKeyDown={(e) => {
                        // Prevent default behavior that might interfere with typing
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      onFocus={() => {
                        if (searchTerm.length >= 2) setOpen(true);
                      }}
                      onBlur={() => {
                        // Delay closing to allow selection
                        setTimeout(() => setOpen(false), 150);
                      }}
                      className="pl-10"
                      data-testid="input-search"
                      autoComplete="off"
                    />
                  </div>
                </PopoverTrigger>
                {filteredSuggestions.length > 0 && (
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <Command>
                      <CommandList>
                        <CommandEmpty>No suggestions found.</CommandEmpty>
                        <CommandGroup>
                          {filteredSuggestions.map((suggestion) => (
                            <CommandItem
                              key={suggestion}
                              value={suggestion}
                              tabIndex={-1}
                              onSelect={(value) => {
                                setSearchTerm(value);
                                setOpen(false);
                              }}
                            >
                              {suggestion}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
                <SelectValue placeholder="All Topics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="capitalize">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Lectures Grid */}
        {filteredLectures.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-no-lectures">
              No lectures found
            </h3>
            <p className="text-muted-foreground" data-testid="text-no-lectures-description">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No published lectures are available at this time.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="lectures-grid">
            {filteredLectures.map((lecture, index) =>
              lecture === 'volcano' ? (
                <VolcanoMockCard key="volcano-mock" />
              ) : lecture === 'hydro' ? (
                <HydroMockCard key="hydro-mock" />
              ) : lecture === null ? (
                <MockLectureCard key="mock-lecture" />
              ) : (
                <LectureCard key={lecture.id} lecture={lecture} />
              )
            )}
          </div>
        )}
      </div>
      <style>{`
        .orb {
          position: absolute;
          width: 20px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }
        .orb1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }
        .orb2 {
          top: 20%;
          right: 20%;
          animation-delay: 1s;
        }
        .orb3 {
          top: 50%;
          left: 20%;
          animation-delay: 2s;
        }
        .orb4 {
          top: 70%;
          right: 10%;
          animation-delay: 3s;
        }
        .orb5 {
          top: 80%;
          left: 50%;
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </section>
  );
}


