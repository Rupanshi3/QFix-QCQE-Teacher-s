import { useMemo, useState } from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { useApp } from '../context/AppContext'

const SCHOOL_STAFF = [
  { id: 'sc-staff-1', name: 'Sunita Sharma', subject: 'Mathematics', year: 'Middle school', classTeacher: true },
  { id: 'sc-staff-2', name: 'Rohit Verma', subject: 'Science', year: 'Middle school', classTeacher: false },
  { id: 'sc-staff-3', name: 'Ananya Bose', subject: 'English', year: 'Senior school', classTeacher: true },
  { id: 'sc-staff-4', name: 'Prakash Deshmukh', subject: 'Administration', year: 'Administration', classTeacher: false },
  { id: 'sc-staff-5', name: 'Ritu Nair', subject: 'Social Studies', year: 'Senior school', classTeacher: false },
]

const COLLEGE_STAFF = [
  { id: 'cb-staff-1', name: 'Rahul Desai', subject: 'Programming Fundamentals', year: 'First year', classTeacher: true },
  { id: 'cb-staff-2', name: 'Megha Kulkarni', subject: 'Data Structures', year: 'Second year', classTeacher: true },
  { id: 'cb-staff-3', name: 'Arvind Iyer', subject: 'Database Systems', year: 'Third year', classTeacher: false },
  { id: 'cb-staff-4', name: 'Pooja Sinha', subject: 'Computer Networks', year: 'Third year', classTeacher: true },
  { id: 'cb-staff-5', name: 'Karan Malhotra', subject: 'Department coordination', year: 'Administration', classTeacher: false },
]

export default function StaffDirectory() {
  const navigate = useNavigate()
  const { currentUser } = useApp()
  const staff = currentUser?.role === 'school' ? SCHOOL_STAFF : COLLEGE_STAFF
  const yearOptions = useMemo(() => ['All', ...Array.from(new Set(staff.map(item => item.year)))], [staff])
  const [selectedYear, setSelectedYear] = useState('All')

  const visibleStaff = staff.filter(item => selectedYear === 'All' || item.year === selectedYear)

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[18px] font-semibold text-foreground">Staff directory</h1>
          <p className="text-[13px] text-muted-foreground">Browse teachers by year and subject</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {yearOptions.map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={`h-9 shrink-0 rounded-full border px-4 text-[13px] font-medium ${
                selectedYear === year
                  ? 'border-primary bg-brand-tint text-primary'
                  : 'border-border bg-card text-foreground'
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="mt-4 divide-y divide-border">
          {visibleStaff.map((teacher) => (
            <div key={teacher.id} className="py-4">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-semibold text-foreground">{teacher.name}</p>
                {teacher.classTeacher && (
                  <Badge className="border-none bg-brand-tint text-primary text-[10px]">Class teacher</Badge>
                )}
              </div>
              <p className="mt-1 text-[13px] text-foreground">{teacher.subject}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">{teacher.year}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
