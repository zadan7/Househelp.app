import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space, shadow, type } from './theme';

/* ---------- Screen wrapper: safe area + keyboard + scroll ---------- */
export const Screen = ({ children, scroll = true, style }) => (
  <SafeAreaView style={[s.screen, style]} edges={['top', 'bottom']}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={s.scrollContent}>{children}</View>
      )}
    </KeyboardAvoidingView>
  </SafeAreaView>
);

/* ---------- Header with back button, title and optional step bar ---------- */
export const ScreenHeader = ({ title, subtitle, onBack, step, totalSteps }) => (
  <View style={s.header}>
    {onBack ? (
      <TouchableOpacity onPress={onBack} style={s.backBtn} accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </TouchableOpacity>
    ) : null}
    {step && totalSteps ? (
      <View style={s.stepRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[s.stepBar, i < step && s.stepBarActive]} />
        ))}
      </View>
    ) : null}
    <Text style={type.h1}>{title}</Text>
    {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
  </View>
);

/* ---------- Card section ---------- */
export const Card = ({ title, icon, children, style }) => (
  <View style={[s.card, style]}>
    {title ? (
      <View style={s.cardTitleRow}>
        {icon ? (
          <View style={s.cardIcon}>
            <Ionicons name={icon} size={16} color={colors.primary} />
          </View>
        ) : null}
        <Text style={type.h2}>{title}</Text>
      </View>
    ) : null}
    {children}
  </View>
);

export const ErrorText = ({ children }) =>
  children ? <Text style={s.error}>{children}</Text> : null;

/* ---------- Text field ---------- */
export const Field = ({ label, error, hint, secure, style, inputStyle, ...props }) => {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);
  return (
    <View style={[s.fieldWrap, style]}>
      {label ? <Text style={type.label}>{label}</Text> : null}
      <View
        style={[
          s.inputBox,
          focused && { borderColor: colors.primary, backgroundColor: colors.white },
          !!error && { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
        ]}
      >
        <TextInput
          {...props}
          style={[s.input, inputStyle]}
          placeholderTextColor="#9AABA2"
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus && props.onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur && props.onBlur(e);
          }}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} accessibilityLabel="Show or hide password">
            <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {hint && !error ? <Text style={type.small}>{hint}</Text> : null}
      <ErrorText>{error}</ErrorText>
    </View>
  );
};

/* ---------- Dropdown (wraps the native Picker) ---------- */
export const Select = ({ label, value, onChange, items, placeholder = 'Select', error }) => (
  <View style={s.fieldWrap}>
    {label ? <Text style={type.label}>{label}</Text> : null}
    <View style={[s.inputBox, { paddingHorizontal: 0 }, !!error && { borderColor: colors.danger }]}>
      <Picker selectedValue={value} onValueChange={onChange} style={{ flex: 1, color: colors.text }}>
        <Picker.Item label={placeholder} value="" color="#9AABA2" />
        {items.map((it) => {
          const item = typeof it === 'string' ? { label: it, value: it } : it;
          return <Picker.Item key={item.value} label={item.label} value={item.value} />;
        })}
      </Picker>
    </View>
    <ErrorText>{error}</ErrorText>
  </View>
);

/* ---------- Multi-select chips ---------- */
export const Chips = ({ options, selected, onToggle }) => (
  <View style={s.chipRow}>
    {options.map((o) => {
      const on = selected.includes(o);
      return (
        <TouchableOpacity
          key={o}
          onPress={() => onToggle(o)}
          style={[s.chip, on && s.chipOn]}
          accessibilityState={{ selected: on }}
        >
          {on ? <Ionicons name="checkmark" size={14} color={colors.white} style={{ marginRight: 4 }} /> : null}
          <Text style={[s.chipText, on && { color: colors.white }]}>{o}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

/* ---------- Photo capture tile ---------- */
export const PhotoTile = ({ label, hint, uri, onPress, error }) => (
  <View style={s.fieldWrap}>
    <Text style={type.label}>{label}</Text>
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.photo, !!error && { borderColor: colors.danger }]}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={s.photoImg} />
          <View style={s.retake}>
            <Ionicons name="camera" size={14} color={colors.white} />
            <Text style={s.retakeText}>Retake</Text>
          </View>
        </>
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Ionicons name="camera-outline" size={28} color={colors.primary} />
          <Text style={s.photoHint}>{hint || 'Tap to add a photo'}</Text>
        </View>
      )}
    </TouchableOpacity>
    <ErrorText>{error}</ErrorText>
  </View>
);

/* ---------- Buttons ---------- */
export const Button = ({ title, onPress, loading, disabled, variant = 'primary', style }) => {
  const secondary = variant === 'secondary';
  const off = disabled || loading;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={off}
      activeOpacity={0.85}
      style={[s.btn, secondary ? s.btnSecondary : s.btnPrimary, off && { opacity: 0.6 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={secondary ? colors.primary : colors.white} />
      ) : (
        <Text style={[s.btnText, secondary && { color: colors.primary }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};


/* ---------- Dashboard hero: greeting + avatar on a green band ---------- */
export const Hero = ({ greeting, name, photo, role }) => (
  <View style={s.hero}>
    <View style={{ flex: 1 }}>
      <Text style={s.heroGreeting}>{greeting}</Text>
      <Text style={s.heroName} numberOfLines={1}>{name}</Text>
      {role ? (
        <View style={s.rolePill}>
          <Text style={s.rolePillText}>{role}</Text>
        </View>
      ) : null}
    </View>
    {photo ? (
      <Image source={{ uri: photo }} style={s.heroAvatar} />
    ) : (
      <View style={[s.heroAvatar, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft }]}>
        <Ionicons name="person" size={30} color={colors.primary} />
      </View>
    )}
  </View>
);

/* ---------- Square action tile used on dashboards ---------- */
export const Tile = ({ title, subtitle, icon, onPress, badge }) => (
  <TouchableOpacity style={s.tile} onPress={onPress} activeOpacity={0.85}>
    <View style={s.tileIcon}>
      <Ionicons name={icon} size={24} color={colors.primary} />
    </View>
    <Text style={s.tileTitle} numberOfLines={1}>{title}</Text>
    {subtitle ? <Text style={s.tileSub} numberOfLines={2}>{subtitle}</Text> : null}
    {badge ? (
      <View style={s.tileBadge}>
        <Text style={s.tileBadgeText}>{badge}</Text>
      </View>
    ) : null}
  </TouchableOpacity>
);


/* ---------- Label / value row for read-only details ---------- */
export const InfoRow = ({ label, value, last }) => (
  <View style={[s.infoRow, !last && s.infoRowBorder]}>
    <Text style={s.infoLabel}>{label}</Text>
    <Text style={s.infoValue}>{value || value === 0 ? String(value) : '—'}</Text>
  </View>
);


/* ---------- Status badge: green = good, amber = waiting, red = problem ---------- */
export const StatusPill = ({ status }) => {
  const v = String(status || '').toLowerCase();
  const bad = /reject|cancel|declin|fail/.test(v);
  const good = /confirm|accept|complete|progress|paid|active|success/.test(v);
  const bg = bad ? colors.dangerSoft : good ? colors.primarySoft : '#FFF4DB';
  const fg = bad ? colors.danger : good ? colors.primary : '#9A6A00';
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <Text style={[s.pillText, { color: fg }]}>{status || 'Pending'}</Text>
    </View>
  );
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  scrollContent: { padding: space.lg, paddingBottom: space.xxl },
  header: { marginBottom: space.lg, gap: space.sm },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  stepRow: { flexDirection: 'row', gap: 6, marginTop: space.xs },
  stepBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  stepBarActive: { backgroundColor: colors.primary },
  subtitle: { ...type.body, color: colors.muted },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.lg,
    gap: space.md,
    ...shadow,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  cardIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: { gap: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
    paddingHorizontal: space.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  input: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 10 },
  error: { color: colors.danger, fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.text },
  photo: {
    height: 150,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: { marginTop: 6, color: colors.primary, fontWeight: '600', fontSize: 13 },
  retake: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  retakeText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  btn: {
    minHeight: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
  },
  btnPrimary: { backgroundColor: colors.primary, ...shadow },
  btnSecondary: { backgroundColor: colors.primarySoft },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: space.xl,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    gap: space.md,
  },
  heroGreeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroName: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: 2 },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: space.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  rolePillText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  heroAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'rgba(255,255,255,0.9)' },
  tile: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: space.lg,
    marginBottom: space.md,
    minHeight: 118,
    ...shadow,
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  tileTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  tileSub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  tileBadge: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tileBadgeText: { fontSize: 10, fontWeight: '800', color: colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, gap: space.md },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { color: colors.muted, fontSize: 13 },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
});
