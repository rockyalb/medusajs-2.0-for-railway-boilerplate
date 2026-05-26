import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, PencilSquare } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { FormEvent, useEffect, useState } from "react"
import { sdk } from "../../lib/client"

type RewardSetting = {
  id: string | null
  percentage: number
  is_enabled: boolean
  start_date: string | null
  end_date: string | null
}

const queryKey = ["loyalty-reward-setting"]

const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return ""
  }

  return new Date(value).toISOString().slice(0, 10)
}

const toStartOfDayIso = (value: string) => {
  return new Date(`${value}T00:00:00.000Z`).toISOString()
}

const toEndOfDayIso = (value: string) => {
  return new Date(`${value}T23:59:59.999Z`).toISOString()
}

const LoyaltyRewardsPage = () => {
  const queryClient = useQueryClient()
  const [percentage, setPercentage] = useState("2")
  const [isEnabled, setIsEnabled] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      sdk.client.fetch<{ reward_setting: RewardSetting }>(
        "/admin/loyalty/reward-settings"
      ),
  })

  useEffect(() => {
    if (!data?.reward_setting) {
      return
    }

    setPercentage(String(data.reward_setting.percentage))
    setIsEnabled(data.reward_setting.is_enabled)
    setStartDate(toDateInputValue(data.reward_setting.start_date))
    setEndDate(toDateInputValue(data.reward_setting.end_date))
  }, [data])

  const mutation = useMutation({
    mutationFn: (body: {
      percentage: number
      is_enabled: boolean
      start_date: string | null
      end_date: string | null
    }) =>
      sdk.client.fetch<{ reward_setting: RewardSetting }>(
        "/admin/loyalty/reward-settings",
        {
          method: "POST",
          body,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success("Loyalty reward settings updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const numericPercentage = Number(percentage)
    if (
      Number.isNaN(numericPercentage) ||
      !Number.isInteger(numericPercentage) ||
      numericPercentage < 0 ||
      numericPercentage > 100
    ) {
      toast.error("Enter a whole percentage between 0 and 100")
      return
    }

    if (startDate && endDate && startDate > endDate) {
      toast.error("End date must be after the start date")
      return
    }

    mutation.mutate({
      percentage: numericPercentage,
      is_enabled: isEnabled,
      start_date: startDate ? toStartOfDayIso(startDate) : null,
      end_date: endDate ? toEndOfDayIso(endDate) : null,
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Loyalty Rewards</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            Set the store credit percentage customers earn after checkout.
          </Text>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-y-6 px-6 py-4"
      >
        <div className="grid max-w-[480px] gap-y-2">
          <Label htmlFor="reward-percentage">Store credit reward</Label>
          <div className="flex items-center gap-x-2">
            <Input
              id="reward-percentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
              disabled={isLoading || mutation.isPending}
            />
            <Text size="small" className="text-ui-fg-subtle">
              %
            </Text>
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            Example: 2 means customers earn 2% of their order total as store credit.
          </Text>
        </div>

        <div className="flex max-w-[480px] items-center justify-between gap-x-4">
          <div>
            <Text size="small" leading="compact" weight="plus">
              Campaign enabled
            </Text>
            <Text size="small" leading="compact" className="text-ui-fg-subtle">
              Disable this to stop issuing checkout rewards.
            </Text>
          </div>
          <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
        </div>

        <div className="grid max-w-[480px] gap-y-4 small:grid-cols-2 small:gap-x-4">
          <div className="grid gap-y-2">
            <Label htmlFor="reward-start-date">Start date</Label>
            <Input
              id="reward-start-date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              disabled={isLoading || mutation.isPending}
            />
            <Text size="small" className="text-ui-fg-subtle">
              Leave empty to start immediately.
            </Text>
          </div>

          <div className="grid gap-y-2">
            <Label htmlFor="reward-end-date">End date</Label>
            <Input
              id="reward-end-date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              disabled={isLoading || mutation.isPending}
            />
            <Text size="small" className="text-ui-fg-subtle">
              Leave empty to keep running.
            </Text>
          </div>
        </div>

        <div>
          <Button size="small" type="submit" isLoading={mutation.isPending}>
            <PencilSquare />
            Save
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Loyalty Rewards",
  icon: ChartBar,
})

export default LoyaltyRewardsPage
