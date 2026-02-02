import { useId, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Switch } from './ui/switch'

const ModeRow = ({ title, description, checked, onCheckedChange, gradientClass }) => {
  const id = useId()

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onCheckedChange(!checked)}
      className="group relative h-auto w-full justify-start overflow-hidden rounded-[1rem] px-3 py-2.5 text-left shadow-sm border border-[color:var(--apple-line)] hover:border-[color:var(--apple-line-strong)] bg-[color:var(--apple-card-strong)] hover:bg-[color:var(--apple-card-hover)]"
    >
      <span
        className={`pointer-events-none absolute inset-0 opacity-0 blur-2xl transition-opacity group-hover:opacity-100 ${gradientClass}`}
      />
        <span className="relative flex w-full items-start gap-3">
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <label htmlFor={id} className="text-sm font-semibold text-[color:var(--apple-ink)]">
              {title}
            </label>
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-[color:var(--apple-muted)]">{description}</span>
        </span>

        <span
          data-switch
          className="flex flex-col items-end gap-1"
          onClick={(event) => event.stopPropagation()}
        >
          <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} aria-label={title} />
          <span className="text-[11px] font-medium text-[color:var(--apple-muted)]">
            {title}
            {checked ? '已开启' : '已关闭'}
          </span>
        </span>
      </span>
    </Button>
  )
}

export const ModeSwitchPanel = ({
  deepThinking,
  onDeepThinkingChange,
  learningMode,
  onLearningModeChange,
  className = '',
}) => {
  return (
    <Card className={`bg-[color:var(--apple-card)] backdrop-blur-xl ${className}`.trim()}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--apple-muted)]">
              模式切换
            </CardTitle>
            <CardDescription className="mt-1 text-[color:var(--apple-ink)]">快速切换常用模式</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2.5">
        <ModeRow
          title="深度思考"
          description="开启后模型会先进行推理思考，再给出更准确的回答。"
          checked={deepThinking}
          onCheckedChange={onDeepThinkingChange}
          gradientClass="bg-gradient-to-br from-[color:var(--apple-ink)]/5 via-[color:var(--apple-ink)]/2 to-[color:var(--apple-ink)]/5"
        />
        <ModeRow
          title="学习模式"
          description="开启后 AI 将以苏格拉底式提问引导你思考，而非直接给出答案。"
          checked={learningMode}
          onCheckedChange={onLearningModeChange}
          gradientClass="bg-gradient-to-br from-[color:var(--apple-ink)]/5 via-[color:var(--apple-ink)]/2 to-[color:var(--apple-ink)]/5"
        />
      </CardContent>
    </Card>
  )
}

export const ModeSwitchPanelDemo = ({ className = '' }) => {
  const [deepThinking, setDeepThinking] = useState(false)
  const [learningMode, setLearningMode] = useState(false)

  return (
    <ModeSwitchPanel
      deepThinking={deepThinking}
      onDeepThinkingChange={setDeepThinking}
      learningMode={learningMode}
      onLearningModeChange={setLearningMode}
      className={className}
    />
  )
}
