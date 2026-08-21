const RADIO_PROVIDER_ROOTS = ["streamtheworld.com", "mdstrm.com"] as const;

export function isRadioProviderHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  return RADIO_PROVIDER_ROOTS.some(
    (root) =>
      normalizedHostname === root || normalizedHostname.endsWith(`.${root}`),
  );
}
