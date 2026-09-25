<script setup lang="ts">
import { z } from 'zod'
import { membershipInputSchema } from '#shared/schemas/membership'
import type { FieldErrors } from '#shared/types/api'
import type { Membership } from '#shared/types/member'
import { MEMBERSHIP_PLANS, PLAN_LABELS, type MembershipPlan } from '#shared/utils/membership'

const { $api } = useNuxtApp()

const props = defineProps<{
  memberId: string
  /** The membership to edit; omit to add a new one. */
  membership?: Membership
  /** Default start date for a new membership (BR-H3). */
  suggestedStartDate: string
}>()

const visible = defineModel<boolean>('visible', { required: true })
const emit = defineEmits<{ saved: [membership: Membership] }>()

const toast = useToast()
const plan = ref<MembershipPlan>('monthly')
const startDate = ref<Date | null>(null)
const clientErrors = ref<FieldErrors>({})
const serverErrors = ref<FieldErrors>({})
const formError = ref('')
const submitting = ref(false)

const planOptions = MEMBERSHIP_PLANS.map(value => ({ label: PLAN_LABELS[value], value }))
const errors = computed(() => ({ ...serverErrors.value, ...clientErrors.value }))
const isEdit = computed(() => !!props.membership)

// Preview only; the server calculates the stored expiry date (BR-P2).
const expiryPreview = computed(() =>
  startDate.value ? formatCalendarDate(calculateExpiryDate(toCalendarDate(startDate.value), plan.value)) : null,
)

watch(visible, (open) => {
  if (!open) return
  plan.value = props.membership?.plan ?? 'monthly'
  startDate.value = fromCalendarDate(props.membership?.startDate ?? props.suggestedStartDate)
  clientErrors.value = {}
  serverErrors.value = {}
  formError.value = ''
}, { immediate: true })

async function save() {
  clientErrors.value = {}
  serverErrors.value = {}
  formError.value = ''

  const parsed = membershipInputSchema.safeParse({
    plan: plan.value,
    startDate: startDate.value ? toCalendarDate(startDate.value) : undefined,
  })
  if (!parsed.success) {
    clientErrors.value = z.flattenError(parsed.error).fieldErrors as FieldErrors
    return
  }

  submitting.value = true
  try {
    const base = `/api/members/${props.memberId}/memberships`
    const membership = props.membership
      ? await $api<Membership>(`${base}/${props.membership.id}`, { method: 'PATCH', body: parsed.data })
      : await $api<Membership>(base, { method: 'POST', body: parsed.data })
    toast.add({ severity: 'success', summary: isEdit.value ? 'Membership updated' : 'Membership added', life: 3000 })
    visible.value = false
    emit('saved', membership)
  }
  catch (error) {
    formError.value = getApiErrorMessage(error)
    serverErrors.value = getApiFieldErrors(error)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="isEdit ? 'Edit membership' : 'Add membership'"
    class="w-[calc(100vw-2rem)] max-w-md"
  >
    <form
      id="membership-form"
      class="flex flex-col gap-4"
      novalidate
      @submit.prevent="save"
    >
      <Message
        v-if="formError"
        severity="error"
        size="small"
        role="alert"
      >
        {{ formError }}
      </Message>

      <div class="flex flex-col gap-1.5">
        <span
          id="plan-label"
          class="text-sm font-medium"
        >Plan</span>
        <SelectButton
          v-model="plan"
          :options="planOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          aria-labelledby="plan-label"
        />
      </div>

      <LabeledField
        label="Start date"
        input-id="startDate"
        :error="errors.startDate?.[0]"
      >
        <DatePicker
          v-model="startDate"
          input-id="startDate"
          date-format="M d, yy"
          :invalid="!!errors.startDate"
          :pt="{ pcInputText: { root: { 'aria-describedby': errors.startDate ? 'startDate-error' : undefined } } }"
          fluid
        />
      </LabeledField>

      <p
        class="rounded-md bg-surface-100 px-3 py-2 text-sm"
        aria-live="polite"
      >
        <template v-if="expiryPreview">
          Expires <span class="font-medium">{{ expiryPreview }}</span>
        </template>
        <template v-else>
          Choose a start date to see the expiry date.
        </template>
      </p>
    </form>

    <template #footer>
      <Button
        label="Cancel"
        severity="secondary"
        text
        @click="visible = false"
      />
      <Button
        type="submit"
        form="membership-form"
        :label="isEdit ? 'Save changes' : 'Add membership'"
        :loading="submitting"
      />
    </template>
  </Dialog>
</template>
