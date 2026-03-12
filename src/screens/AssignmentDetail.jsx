import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CaretLeft, Bell, DotsThreeVertical, Lock, Warning } from '@phosphor-icons/react'
import { useApp } from '../context/AppContext'
import { submissionDetail } from '../data/seed'
import { formatDueDate } from '../lib/utils'
import BottomSheet from '../components/BottomSheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function AssignmentDetail() {
  const { assignmentId } = useParams()
  const [searchParams] = useSearchParams()
  const classId = searchParams.get('classId')
  const navigate = useNavigate()
  const { getAssignmentsForClass, deleteAssignment } = useApp()
  const [reminded, setReminded] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const assignments = getAssignmentsForClass(classId || '')
  const assignment = assignments.find(a => a.id === assignmentId)

  if (!assignment) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-stone-50">
        <p className="text-[15px] text-muted-foreground">Assignment not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-[15px] text-primary font-medium">Go back</button>
      </div>
    )
  }

  const isOverdue = assignment.overdue
  const submittedList = submissionDetail.submitted
  const pendingList = submissionDetail.pending
  const dueLabel = formatDueDate(assignment.dueDate)

  const handleDelete = () => {
    if (classId) deleteAssignment(classId, assignmentId)
    navigate(-1)
  }

  const handleRemind = (studentId) => setReminded(prev => ({ ...prev, [studentId]: true }))
  const handleRemindAll = () => {
    const all = {}
    pendingList.forEach(s => { all[s.id] = true })
    setReminded(all)
  }

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-3 pb-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors" aria-label="Go back">
          <CaretLeft size={20} color="var(--color-foreground)" weight="bold" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-semibold text-foreground truncate">{assignment.title}</h1>
          <p className="text-[13px] text-muted-foreground">{dueLabel}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-11 h-11 flex items-center justify-center rounded-lg active:bg-muted transition-colors"
              aria-label="More options"
            >
              <DotsThreeVertical size={20} color="var(--color-muted-foreground)" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive text-[15px] font-medium"
              onSelect={() => setShowDeleteConfirm(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete confirmation */}
      <BottomSheet isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete assignment?">
        <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
          <p className="text-[13px] text-muted-foreground">
            This will permanently remove "{assignment.title}" and all submission records.
          </p>
          <Button
            variant="destructive"
            className="w-full h-12 text-[15px] font-semibold rounded-lg"
            onClick={handleDelete}
          >
            Delete assignment
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-[15px] font-semibold rounded-lg border-border text-foreground"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Keep assignment
          </Button>
        </div>
      </BottomSheet>

      {/* Tabs */}
      <Tabs defaultValue="submitted" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b border-border bg-card h-auto p-0">
          <TabsTrigger
            value="submitted"
            className="flex-1 py-3 text-[15px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground bg-transparent shadow-none"
          >
            Submitted ({submittedList.length})
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="flex-1 py-3 text-[15px] font-semibold rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground bg-transparent shadow-none"
          >
            Pending ({pendingList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submitted" className="flex-1 overflow-y-auto px-4 pt-4 pb-4 mt-0">
          <ul className="flex flex-col gap-3 list-none">
            {submittedList.map(student => (
              <li key={student.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="text-[13px] font-bold bg-brand-tint text-primary">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-[13px] text-muted-foreground">{student.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" aria-label="Submitted" />
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="pending" className="flex-1 overflow-y-auto px-4 pt-4 pb-4 mt-0 flex flex-col gap-3">
          {isOverdue && (
            <div className="flex items-center gap-2 bg-warning-muted border border-warning/20 rounded-lg px-4 py-3">
              <Warning size={14} weight="fill" color="var(--color-warning)" />
              <p className="text-[13px] text-warning font-medium">Due date passed — list locked</p>
              <Lock size={13} color="var(--color-warning)" className="ml-auto" />
            </div>
          )}
          <ul className="flex flex-col gap-3 list-none">
            {pendingList.map(student => (
              <li key={student.id} className={`bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 ${isOverdue ? 'opacity-60' : ''}`}>
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarFallback className="text-[13px] font-bold bg-brand-tint text-primary">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-foreground truncate">{student.name}</p>
                  <p className="text-[13px] text-muted-foreground">Roll {student.roll}</p>
                </div>
                {!isOverdue && (
                  <button
                    onClick={() => handleRemind(student.id)}
                    disabled={reminded[student.id]}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all border ${
                      reminded[student.id]
                        ? 'border-border text-muted-foreground bg-muted'
                        : 'border-border text-foreground active:bg-muted'
                    }`}
                  >
                    <Bell size={13} weight={reminded[student.id] ? 'fill' : 'regular'} />
                    {reminded[student.id] ? 'Reminded' : 'Remind'}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {!isOverdue && (
            <div className="mt-auto pt-4">
              <Button
                variant="outline"
                onClick={handleRemindAll}
                className="w-full h-12 rounded-lg text-[15px] font-semibold border-border text-foreground"
              >
                <Bell size={16} />
                Remind all pending
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
