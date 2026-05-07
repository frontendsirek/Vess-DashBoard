import { TestCard } from '@/components/test-management/TestCard'
import { type TestRecord } from '@/data/mock'

type TestCardGridProps = {
  tests: TestRecord[]
  onView?: (test: TestRecord) => void
}

export function TestCardGrid({ tests, onView }: TestCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {tests.map((test) => (
        <TestCard key={test.id} test={test} onView={onView} />
      ))}
    </div>
  )
}
