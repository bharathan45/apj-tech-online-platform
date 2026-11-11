import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CourseArtwork } from '../components/CourseArtwork';
import { useSite } from '../context/SiteContext';

export function CoursesPage() {
  const { content, courses, loading } = useSite();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => {
    const unique = Array.from(new Set(courses.map((c) => c.category)));
    return ['All', ...unique];
  }, [courses]);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = category === 'All' || c.category === category;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.shortDescription.toLowerCase().includes(q) ||
        c.syllabusOverview.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [courses, category, search]);

  return (
    <div>
      <section className="bg-[#071426] text-white py-16 border-b border-[#102B50]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs sm:text-sm font-semibold text-[#E5AC32]">
            {content.onlineBanner}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance max-w-3xl">
            Online IT Training Courses
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Explore structured online courses with complete module-wise syllabi, sample lessons,
            practice exercises, downloadable materials, and hands-on projects.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F4F7FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200">
            <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-lg border border-slate-200">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    category === cat
                      ? 'bg-[#071426] text-white'
                      : 'text-slate-600 hover:text-[#071426] hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search courses or topics..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#258BFF]"
              />
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-10 bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="font-display text-lg font-semibold text-[#071426]">
                No courses matched your filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setCategory('All');
                  setSearch('');
                }}
                className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#258BFF] rounded-lg cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filtered.map((course) => (
                <article
                  key={course.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-[#258BFF]/50 transition-colors"
                >
                  <CourseArtwork course={course} className="h-48 w-full" />
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        {course.category} <span aria-hidden="true">·</span> {course.modules.length}{' '}
                        Modules <span aria-hidden="true">·</span> 100% Online
                      </p>
                      <h2 className="mt-2 font-display text-xl font-bold text-[#071426]">
                        {course.title}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        {course.shortDescription}
                      </p>
                      <p className="mt-4 text-xs text-slate-500 line-clamp-2">
                        {course.syllabusOverview}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <Link
                        to={`/courses/${course.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#258BFF] hover:text-[#102B50]"
                      >
                        <span>View Full Course</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/courses/${course.slug}#enquire`}
                        className="px-3.5 py-2 text-xs font-semibold text-white bg-[#071426] hover:bg-[#102B50] rounded-md transition-colors whitespace-nowrap"
                      >
                        Enquire Now
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
