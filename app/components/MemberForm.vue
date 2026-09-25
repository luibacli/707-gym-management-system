<script setup lang="ts">
import { z } from 'zod'
import { memberInputSchema, type MemberFormValues, type MemberInput } from '#shared/schemas/member'
import type { FieldErrors } from '#shared/types/api'
import type { Member } from '#shared/types/member'

const props = defineProps<{
  member?: Member
  submitLabel: string
  cancelTo: string
  submitting: boolean
  formError?: string
  serverErrors?: FieldErrors
}>()

const emit = defineEmits<{ submit: [input: MemberInput] }>()

const form = reactive<Required<{ [K in keyof MemberFormValues]: string }>>({
  firstName: props.member?.firstName ?? '',
  lastName: props.member?.lastName ?? '',
  phone: props.member?.phone ?? '',
  email: props.member?.email ?? '',
  birthDate: props.member?.birthDate ?? '',
  address: props.member?.address ?? '',
  emergencyContactName: props.member?.emergencyContactName ?? '',
  emergencyContactPhone: props.member?.emergencyContactPhone ?? '',
  notes: props.member?.notes ?? '',
})

// DatePicker works with Date objects; the form stores a calendar date (ADR-006).
const birthDate = computed({
  get: () => (form.birthDate ? fromCalendarDate(form.birthDate) : null),
  set: (value: Date | null | undefined) => {
    form.birthDate = value ? toCalendarDate(value) : ''
  },
})
const today = fromCalendarDate(todayInGymTimeZone())

const clientErrors = ref<FieldErrors>({})
const errors = computed(() => ({ ...props.serverErrors, ...clientErrors.value }))
const errorFor = (field: keyof MemberFormValues) => errors.value[field]?.[0]
const describedBy = (field: keyof MemberFormValues) => (errorFor(field) ? `${field}-error` : undefined)

function onSubmit() {
  clientErrors.value = {}
  const parsed = memberInputSchema.safeParse(form)
  if (!parsed.success) {
    clientErrors.value = z.flattenError(parsed.error).fieldErrors as FieldErrors
    return
  }
  emit('submit', parsed.data)
}
</script>

<template>
  <form
    class="flex flex-col gap-6"
    novalidate
    @submit.prevent="onSubmit"
  >
    <Message
      v-if="formError"
      severity="error"
      size="small"
      role="alert"
    >
      {{ formError }}
    </Message>

    <section class="rounded-lg border border-surface-200 bg-surface-0 p-4 sm:p-6">
      <h2 class="mb-4 font-semibold">
        Personal details
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <LabeledField
          label="First name"
          input-id="firstName"
          :error="errorFor('firstName')"
        >
          <InputText
            id="firstName"
            v-model="form.firstName"
            autocomplete="off"
            :invalid="!!errorFor('firstName')"
            :aria-describedby="describedBy('firstName')"
            fluid
          />
        </LabeledField>
        <LabeledField
          label="Last name"
          input-id="lastName"
          :error="errorFor('lastName')"
        >
          <InputText
            id="lastName"
            v-model="form.lastName"
            autocomplete="off"
            :invalid="!!errorFor('lastName')"
            :aria-describedby="describedBy('lastName')"
            fluid
          />
        </LabeledField>
        <LabeledField
          label="Phone"
          input-id="phone"
          :error="errorFor('phone')"
        >
          <InputText
            id="phone"
            v-model="form.phone"
            type="tel"
            autocomplete="off"
            :invalid="!!errorFor('phone')"
            :aria-describedby="describedBy('phone')"
            fluid
          />
        </LabeledField>
        <LabeledField
          label="Email"
          input-id="email"
          optional
          :error="errorFor('email')"
        >
          <InputText
            id="email"
            v-model="form.email"
            type="email"
            autocomplete="off"
            :invalid="!!errorFor('email')"
            :aria-describedby="describedBy('email')"
            fluid
          />
        </LabeledField>
        <LabeledField
          label="Birth date"
          input-id="birthDate"
          optional
          :error="errorFor('birthDate')"
        >
          <DatePicker
            v-model="birthDate"
            input-id="birthDate"
            date-format="M d, yy"
            :max-date="today"
            :invalid="!!errorFor('birthDate')"
            :pt="{ pcInputText: { root: { 'aria-describedby': describedBy('birthDate') } } }"
            show-button-bar
            fluid
          />
        </LabeledField>
        <LabeledField
          class="sm:col-span-2"
          label="Address"
          input-id="address"
          optional
          :error="errorFor('address')"
        >
          <Textarea
            id="address"
            v-model="form.address"
            rows="2"
            auto-resize
            :invalid="!!errorFor('address')"
            :aria-describedby="describedBy('address')"
            fluid
          />
        </LabeledField>
      </div>
    </section>

    <section class="rounded-lg border border-surface-200 bg-surface-0 p-4 sm:p-6">
      <h2 class="mb-4 font-semibold">
        Emergency contact
      </h2>
      <div class="grid gap-4 sm:grid-cols-2">
        <LabeledField
          label="Name"
          input-id="emergencyContactName"
          optional
          :error="errorFor('emergencyContactName')"
        >
          <InputText
            id="emergencyContactName"
            v-model="form.emergencyContactName"
            autocomplete="off"
            :invalid="!!errorFor('emergencyContactName')"
            :aria-describedby="describedBy('emergencyContactName')"
            fluid
          />
        </LabeledField>
        <LabeledField
          label="Phone"
          input-id="emergencyContactPhone"
          optional
          :error="errorFor('emergencyContactPhone')"
        >
          <InputText
            id="emergencyContactPhone"
            v-model="form.emergencyContactPhone"
            type="tel"
            autocomplete="off"
            :invalid="!!errorFor('emergencyContactPhone')"
            :aria-describedby="describedBy('emergencyContactPhone')"
            fluid
          />
        </LabeledField>
      </div>
    </section>

    <section class="rounded-lg border border-surface-200 bg-surface-0 p-4 sm:p-6">
      <LabeledField
        label="Notes"
        input-id="notes"
        optional
        :error="errorFor('notes')"
      >
        <Textarea
          id="notes"
          v-model="form.notes"
          rows="3"
          auto-resize
          :invalid="!!errorFor('notes')"
          :aria-describedby="describedBy('notes')"
          fluid
        />
      </LabeledField>
    </section>

    <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button
        as="router-link"
        :to="cancelTo"
        label="Cancel"
        severity="secondary"
        text
      />
      <Button
        type="submit"
        :label="submitLabel"
        :loading="submitting"
      />
    </div>
  </form>
</template>
