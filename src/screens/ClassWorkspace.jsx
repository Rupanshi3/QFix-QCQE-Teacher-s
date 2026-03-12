import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  CaretLeft, ClipboardText, CheckCircle,
  ChatCircle, Users, Plus,
} from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import AssignmentCard from '../components/AssignmentCard'
import AssignmentForm from '../components/AssignmentForm'
import BottomSheet from '../components/BottomSheet'
import { Button } from '@/components/ui/button'

const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

export default function ClassWorkspace() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { getClassById, getAssignmentsForClass, addAssignment } = useApp()

  const cls = getClassById(classId)
  const assignments = getAssignmentsForClass(classId)

  const [sheetOpen, setSheetOpen] = useState(false)

  if (!cls) return null

  const isMarked = cls.attendance === 'marked'

  const handlePostAssignment = ({ title, description, dueDate }) => {
    addAssignment(classId, { title, description, dueDate })
    setSheetOpen(false)
  }

  const visibleAssignments = assignments.slice(0, 3)

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Sticky header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
          aria-label="Back"
        >
          <CaretLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate">{cls.displayName}</h1>
          <p className="text-[13px] text-muted-foreground">{today}</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8 flex flex-col gap-4">
        {/* Attendance CTA */}
        {isMarked ? (
          <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-muted flex items-center justify-center flex-shrink-0">
              <CheckCircle size={22} weight="fill" color="var(--color-success)" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-foreground">Attendance marked</p>
              <p className="text-[13px] text-muted-foreground">Recorded for today</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/attendance/${classId}`)}
              className="rounded-lg border-border text-foreground text-[13px] h-9"
            >
              Edit
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => navigate(`/attendance/${classId}`)}
            className="w-full h-14 rounded-lg text-[15px] font-semibold flex items-center gap-2"
          >
            <ClipboardText size={20} />
            Mark Attendance
          </Button>
        )}

        {/* Assignments section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold text-foreground">Assignments</h2>
          </div>
          <div className="flex flex-col gap-4">
            {visibleAssignments.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-4 text-center">
                <p className="text-[13px] text-muted-foreground">No assignments yet</p>
              </div>
            ) : (
              visibleAssignments.map(asgn => (
                <AssignmentCard
                  key={asgn.id}
                  assignment={asgn}
                  onClick={() => navigate(`/assignment/${asgn.id}?classId=${classId}`)}
                />
              ))
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setSheetOpen(true)}
            className="w-full mt-3 h-12 rounded-lg text-[15px] font-semibold text-foreground border-border flex items-center gap-2"
          >
            <Plus size={16} weight="bold" color="var(--color-primary)" />
            New Assignment
          </Button>
        </div>

        {/* Students row */}
        <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <Users size={20} color="var(--color-muted-foreground)" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold text-foreground">Students</p>
            <p className="text-[13px] text-muted-foreground">{cls.totalStudents} enrolled</p>
          </div>
        </div>

        {/* Communication CTA */}
        <Button
          variant="outline"
          onClick={() => navigate(`/channel/${cls.channelId}`)}
          className="w-full h-14 rounded-lg text-[15px] font-semibold text-foreground border-border flex items-center gap-2"
        >
          <ChatCircle size={18} color="var(--color-primary)" />
          Open Class Feed
        </Button>
      </div>

      {/* Assignment creation bottom sheet */}
      <BottomSheet isOpen={sheetOpen} onClose={() => setSheetOpen(false)} title="New Assignment">
        <AssignmentForm onSubmit={handlePostAssignment} showDescription showAttach />
      </BottomSheet>
    </div>
  )
}
