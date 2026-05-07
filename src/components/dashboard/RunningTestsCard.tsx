import { runningTests } from '@/data/mock'
import { cn } from '@/lib/utils'

export function RunningTestsCard() {
  return (
    <section className="flex h-full flex-col gap-8 rounded-2xl bg-vess-grey-50 p-4">
      <header className="flex h-9 items-center justify-between">
        <h2 className="text-[20px] font-medium leading-6 text-vess-grey-950">
          Running Test ({runningTests.length})
        </h2>
        <span className="rounded-full bg-vess-green-50 px-1.5 py-1.5 text-[15px] font-normal leading-[18px] text-vess-green-900">
          {runningTests.length} active
        </span>
      </header>

      <div className="flex flex-col gap-6">
        {runningTests.map((test) => (
          <ProgressRow key={test.id} test={test} />
        ))}
      </div>
    </section>
  )
}

function ProgressRow({ test }: { test: (typeof runningTests)[number] }) {
  const isRed = test.tone === 'red'
  const dotClass = isRed ? 'bg-vess-red-500' : 'bg-vess-primary-400'
  const barClass = isRed ? 'bg-vess-red-500' : 'bg-vess-primary-400'
  const signalClass = isRed ? 'text-vess-red-500' : 'text-vess-grey-950'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={cn('size-[7px] rounded-full', dotClass)} aria-hidden />
          <p className="text-[15px] font-medium leading-[18px] text-vess-grey-950">
            {test.name}
          </p>
        </div>
        <span className="text-[10px] font-light leading-3 tracking-[0.4px] text-vess-grey-950">
          {test.progress}%
        </span>
      </div>
      <div
        className="h-[7px] w-full overflow-hidden rounded bg-vess-grey-100"
        role="progressbar"
        aria-valuenow={test.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${test.name} progress`}
      >
        <div className={cn('h-full', barClass)} style={{ width: `${test.progress}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] font-light leading-3 tracking-[0.4px]">
        <span className="text-vess-grey-950">
          {test.elapsed} / {test.duration}
        </span>
        <span className={signalClass}>
          {test.signal} · {test.network}
        </span>
      </div>
    </div>
  )
}
