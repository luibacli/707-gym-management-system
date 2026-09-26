import type { MemberStatus, MembershipStatus } from '#shared/utils/membership'

type AnyStatus = MemberStatus | MembershipStatus

// Semantic colors keep their meaning, and always come with an icon and a label (docs/ui-design.md).
export const STATUS_SEVERITY = {
  'active': 'success',
  'near-expiry': 'warn',
  'expired': 'danger',
  'scheduled': 'info',
  'none': 'secondary',
} as const satisfies Record<AnyStatus, string>

export const STATUS_ICON: Record<AnyStatus, string> = {
  'active': 'pi pi-check-circle',
  'near-expiry': 'pi pi-clock',
  'expired': 'pi pi-times-circle',
  'scheduled': 'pi pi-calendar',
  'none': 'pi pi-minus-circle',
}
