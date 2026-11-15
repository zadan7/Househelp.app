// Design tokens for the Househelp app. Import from here instead of hardcoding colours.
export const colors = {
  primary: '#0B7A4B',
  primaryDark: '#075B38',
  primarySoft: '#E7F5EE',
  accent: '#F5A524',
  bg: '#F5F7F6',
  card: '#FFFFFF',
  text: '#14201A',
  muted: '#667A70',
  border: '#DCE4DF',
  danger: '#D64545',
  dangerSoft: '#FDECEC',
  white: '#FFFFFF',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

export const shadow = {
  shadowColor: '#0B1F16',
  shadowOpacity: 0.07,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

export const type = {
  h1: { fontSize: 26, fontWeight: '800', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  label: { fontSize: 13, fontWeight: '600', color: colors.muted },
  small: { fontSize: 12, color: colors.muted },
};
