import { NextRequest, NextResponse } from 'next/server'
import type { BlockItOutput } from '@/types/database'
import { buildExportText } from '@/lib/ai'

export async function POST(request: NextRequest) {
  let body: { output: BlockItOutput; crm: string; format: string; company?: string; contact?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { output, crm, format, company, contact } = body

  if (format === 'csv') {
    const rows = [
      ['Date', 'Company', 'Contact', 'Stage', 'Health Score', 'Deal Value', 'Next Action', 'CRM Notes'].join(','),
      [
        new Date().toLocaleDateString(),
        company || output.company || '',
        contact || output.contact_name || '',
        output.deal_stage || '',
        output.health_score?.toString() || '',
        output.deal_value?.toString() || '',
        (output.next_best_action || '').replace(/,/g, ';'),
        (output.crm_notes || '').replace(/,/g, ';').replace(/\n/g, ' '),
      ].map((v) => `"${v}"`).join(','),
    ]
    return NextResponse.json({ text: rows.join('\n') })
  }

  const crmName = {
    salesforce: 'Salesforce',
    hubspot: 'HubSpot',
    dynamics: 'Dynamics 365',
    zoho: 'Zoho CRM',
    pipedrive: 'Pipedrive',
  }[format] || crm || 'CRM'

  const text = buildExportText(output, crmName, company || output.company, contact || output.contact_name)

  return NextResponse.json({ text })
}
