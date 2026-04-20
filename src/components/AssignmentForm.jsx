import { useState } from 'react'
import { Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export default function AssignmentForm({ onSubmit, showDescription = false, showAttach = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [dueToggle, setDueToggle] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [reminderToggle, setReminderToggle] = useState(false)
  const [reminderTime, setReminderTime] = useState('')
  const [reminderRepeatDays, setReminderRepeatDays] = useState('2')
  const [titleError, setTitleError] = useState(false)

  const handlePost = () => {
    if (!title.trim()) { setTitleError(true); return }
    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate || 'TBD',
      attachmentName: selectedFileName || null,
      reminderTime: reminderTime || null,
      reminderRepeatDays: reminderRepeatDays || null,
    })
    setTitle(''); setDescription(''); setDueToggle(false)
    setDueDate(''); setReminderToggle(false); setReminderTime(''); setReminderRepeatDays('2')
    setSelectedFileName(''); setTitleError(false)
  }

  return (
    <div className="px-4 pt-4 flex flex-col gap-4">
      <div>
        <label className="text-[13px] font-medium text-foreground mb-1.5 block">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          value={title}
          onChange={e => { setTitle(e.target.value); setTitleError(false) }}
          placeholder={showDescription ? 'e.g. Chapter 6 Practice Problems' : 'Assignment title'}
          className={`h-12 rounded-lg text-[15px] ${titleError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
        />
        {titleError && (
          <p className="text-[13px] text-destructive mt-1 flex items-center gap-1">
            <Warning size={13} weight="fill" /> Title is required
          </p>
        )}
      </div>

      {showDescription && (
        <div>
          <label className="text-[13px] font-medium text-foreground mb-1.5 block">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add instructions or notes…"
            rows={3}
            className="rounded-lg text-[15px] border-border resize-none"
          />
        </div>
      )}

      {showAttach && (
        <div>
          <label className="text-[13px] font-medium text-foreground mb-1.5 block">
            Attach file <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <label className="flex h-12 w-full cursor-pointer items-center rounded-lg border border-border bg-background px-3 text-[15px] text-muted-foreground">
            <span className="truncate">{selectedFileName || 'Choose a file'}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
              onChange={e => setSelectedFileName(e.target.files?.[0]?.name || '')}
              className="sr-only"
            />
          </label>
          <p className="text-[12px] text-muted-foreground mt-1.5">
            Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG. Max file size: 10MB.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-[15px] font-medium text-foreground">Set due date</p>
          {dueToggle && dueDate && <p className="text-[13px] text-muted-foreground mt-0.5">{dueDate}</p>}
        </div>
        <Switch checked={dueToggle} onCheckedChange={setDueToggle} aria-label="Set due date" />
      </div>
      {dueToggle && (
        <div className="flex flex-col gap-3">
          <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="h-12 rounded-lg text-[15px] border-border" />
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-[15px] font-medium text-foreground">Schedule reminder</p>
              {reminderToggle && reminderTime && <p className="text-[13px] text-muted-foreground mt-0.5">{reminderTime}</p>}
            </div>
            <Switch checked={reminderToggle} onCheckedChange={setReminderToggle} aria-label="Schedule reminder" />
          </div>
          {reminderToggle && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[13px] font-medium text-foreground mb-1.5 block">Reminder time</label>
                <Input
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  className="h-12 rounded-lg text-[15px] border-border"
                />
              </div>
              <div>
                <label className="text-[13px] font-medium text-foreground mb-1.5 block">Repeat every</label>
                <Input
                  type="text"
                  value={`${reminderRepeatDays} days`}
                  readOnly
                  className="h-12 rounded-lg text-[15px] border-border text-muted-foreground"
                />
              </div>
            </div>
          )}
        </div>
      )}

      <Button className="w-full h-12 text-[15px] font-semibold rounded-lg" onClick={handlePost}>
        Post Assignment
      </Button>
    </div>
  )
}
