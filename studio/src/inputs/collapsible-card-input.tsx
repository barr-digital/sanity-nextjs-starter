import { type ReactNode, useState } from 'react'
import { Box, Button, Card, Flex } from '@sanity/ui'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ObjectInputProps } from 'sanity'

type CollapsibleCardInputProps = ObjectInputProps & {
  renderCard: () => ReactNode
  renderForm?: (renderDefault: () => ReactNode) => ReactNode
  defaultExpanded?: boolean
}

export function CollapsibleCardInput(props: CollapsibleCardInputProps) {
  const { renderCard, renderForm, defaultExpanded = false, ...inputProps } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  const renderDefault = () => inputProps.renderDefault(inputProps)
  const formContent = renderForm ? renderForm(renderDefault) : renderDefault()

  if (!expanded) {
    return (
      <Card
        padding={4}
        radius={2}
        shadow={1}
        tone="default"
        onClick={() => setExpanded(true)}
        style={{ cursor: 'pointer' }}
      >
        <Flex justify="space-between" align="center" gap={4}>
          <Box flex={1}>{renderCard()}</Box>
          <ChevronDown size={16} />
        </Flex>
      </Card>
    )
  }

  if (defaultExpanded) {
    return <>{formContent}</>
  }

  return (
    <Card padding={3} radius={2} shadow={1} tone="default">
      <Flex justify="flex-end">
        <Button mode="bleed" icon={ChevronUp} text="Collapse" onClick={() => setExpanded(false)} />
      </Flex>
      <Box marginTop={3}>{formContent}</Box>
    </Card>
  )
}
