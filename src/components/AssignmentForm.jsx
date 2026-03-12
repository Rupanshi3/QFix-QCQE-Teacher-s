import { useState } from 'react'
import { Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export default function AssignmentForm({ onSubmit, showDescription = false, showAttach = false }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueToggle, setDueToggle] = useState(false)
  const [dueDate, setDueDate] = useState('')
  const [attachToggle, setAttachToggle] = useState(false)
  const [titleError, setTitleError] = useState(false)

  const handlePost = () => {
    if (!title.trim()) { setTitleError(true); return }
    onSubmit({ title: title.trim(), description: description.trim() || null, dueDate: dueDate || 'TBD' })
    setTitle(''); setDescription(''); setDueToggle(false)
    setDueDate(''); setAttachToggle(false); setTitleError(false)
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

      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-[15px] font-medium text-foreground">Set due date</p>
          {dueToggle && dueDate && <p className="text-[13px] text-muted-foreground mt-0.5">{dueDate}</p>}
        </div>
        <Switch checked={dueToggle} onCheckedChange={setDueToggle} aria-label="Set due date" />
      </div>
      {dueToggle && (
        <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
          className="h-12 rounded-lg text-[15px] border-border" />
      )}

      {showAttach && (
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-[15px] font-medium text-foreground">Attach file</p>
            {attachToggle && <p className="text-[13px] text-muted-foreground mt-0.5">PDF only · Max 10MB</p>}
          </div>
          <Switch checked={attachToggle} onCheckedChange={setAttachToggle} aria-label="Attach file" />
        </div>
      )}

      <Button className="w-full h-12 text-[15px] font-semibold rounded-lg" onClick={handlePost}>
        Post Assignment
      </Button>
    </div>
  )
}
