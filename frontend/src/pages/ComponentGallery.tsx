import { useState } from 'react'
import { Header } from '../components/layout/Header'
import {
  Alert,
  Badge,
  Button,
  Card,
  Chip,
  EditModal,
  EmptyState,
  Field,
  FieldGroup,
  NoticeBanner,
  OptionList,
  PlatformDot,
  SearchInput,
  SectionLabel,
  SegmentedControl,
  Select,
  TextInput,
  Textarea,
} from '../components/ui'
import type { ServicePlatform } from '../lib/platform'

const companies = [
  { id: 'acetech', title: '에이스테크놀로지(주)', subtitle: 'acetech · ace-tech.buptle.app', trailing: '유저 128명' },
  { id: 'hanil_ind', title: '한일산업', subtitle: 'hanil_ind · hanil.buptle.app', trailing: '유저 64명' },
]

/** 컴포넌트 확인용 갤러리 */
export default function ComponentGallery() {
  const [platform, setPlatform] = useState<ServicePlatform>('BUPTLE_BIZ')
  const [selected, setSelected] = useState<string | null>('acetech')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState(true)
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('에이스테크놀로지(주)')
  const [ticket, setTicket] = useState('')
  const [reason, setReason] = useState('')
  const [chip, setChip] = useState(true)

  const changes = name !== '에이스테크놀로지(주)' ? [{ field: '고객사명', before: '에이스테크놀로지(주)', after: name }] : []
  const filtered = companies.filter((c) => c.id.includes(query.trim().toLowerCase()) || c.title.includes(query.trim()))

  return (
    <div className="min-h-screen">
      <Header company={selected ?? undefined} userLabel="김효선 · 운영개발자" hasNotice={notice} />
      <main className="mx-auto flex max-w-[880px] flex-col gap-8 px-8 py-10">
        {notice && (
          <NoticeBanner
            title="컨피그 불일치 · 조치 필요"
            count="미등록 3건"
            actionLabel="미등록 컨피그 확인"
            onAction={() => setNotice(false)}
            onDismiss={() => setNotice(false)}
          >
            운영 시스템(Buptle Biz)에 적용된 컨피그가 관리 시스템에 등록되어 있지 않습니다. 마지막 배치 08:30
          </NoticeBanner>
        )}

        <section className="flex flex-col gap-4">
          <h1 className="m-0 text-[30px] font-bold leading-tight tracking-tight">작업이 필요한 고객사를 선택하세요</h1>
          <SegmentedControl
            label="서비스"
            value={platform}
            onChange={setPlatform}
            options={[
              { value: 'BUPTLE_BIZ', label: 'Buptle Biz', leading: <PlatformDot platform="BUPTLE_BIZ" /> },
              { value: 'BUPTLE_NOVA', label: 'Buptle Nova', leading: <PlatformDot platform="BUPTLE_NOVA" /> },
            ]}
          />
          <div className="flex items-center gap-2">
            <SearchInput aria-label="고객사 검색" placeholder="스키마명으로 검색" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button variant="dark">검색</Button>
          </div>
          <div className="flex flex-col gap-1.5">
            <SectionLabel>{platform === 'BUPTLE_BIZ' ? 'Buptle Biz 고객사' : 'Buptle Nova 고객사'}</SectionLabel>
            <OptionList
              label="고객사"
              options={platform === 'BUPTLE_BIZ' ? filtered : []}
              selectedId={selected}
              onSelect={setSelected}
              emptyMessage="검색 결과가 없습니다. 스키마명을 다시 확인해 주세요."
            />
          </div>
        </section>

        <Card className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="dark">Dark</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Badge tone="danger">미등록 3건</Badge>
            <Badge tone="success">활성</Badge>
            <Badge tone="warn">주의</Badge>
            <Badge tone="biz">Biz</Badge>
            <Badge tone="nova">Nova</Badge>
          </div>
          <Alert tone="info">정보 안내 박스입니다.</Alert>
          <Alert tone="warn">주의 안내 박스입니다. 수정 불가 사유나 수정 위치를 알려 줄 때 씁니다.</Alert>
          <Alert tone="danger">권한이 없는 계정입니다. 운영관리 시스템에 등록된 사용자만 접근할 수 있습니다.</Alert>
          <Chip label="계약" checked={chip} onChange={(e) => setChip(e.target.checked)} />
          <EmptyState title="검색 결과가 없습니다" description="조건을 바꿔 다시 검색해 주세요." />
          <div>
            <Button onClick={() => setModal(true)}>수정 모달 열기</Button>
          </div>
        </Card>
      </main>

      {modal && (
        <EditModal
          title="고객사 정보 수정"
          changes={changes}
          audit={{ actor: '김효선 (운영개발자)', at: '2026-10-18 21:50', company: '에이스테크놀로지(주) · acetech', action: '고객사 수정' }}
          ticket={ticket}
          onTicketChange={setTicket}
          reason={reason}
          onReasonChange={setReason}
          onClose={() => setModal(false)}
          onSave={() => setModal(false)}
        >
          <FieldGroup title="기본 정보">
            <Field label="스키마명" readOnlyHint>{(id) => <TextInput id={id} readOnly value="acetech" />}</Field>
            <Field label="상태">
              {(id) => (
                <Select id={id}>
                  <option>활성</option>
                  <option>비활성</option>
                </Select>
              )}
            </Field>
            <Field label="고객사명" required className="col-span-2">
              {(id) => <TextInput id={id} value={name} onChange={(e) => setName(e.target.value)} />}
            </Field>
            <Field label="메모" className="col-span-2">{(id) => <Textarea id={id} rows={2} />}</Field>
          </FieldGroup>
        </EditModal>
      )}
    </div>
  )
}
