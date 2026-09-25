import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

// Brand red as the primary color (docs/ui-design.md, ADR-004).
// Uses Aura's built-in red scale until exact brand values are confirmed.
const BrandPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}',
    },
  },
})

export default {
  preset: BrandPreset,
  options: {
    // Light mode only for now: dark mode activates only if this class is added.
    darkModeSelector: '.app-dark',
    cssLayer: {
      name: 'primevue',
      order: 'theme, base, primevue',
    },
  },
}
