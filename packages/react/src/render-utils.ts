export const toReactEventName = (event: string): string =>
  `on${event.slice(0, 1).toUpperCase()}${event.slice(1)}`;

export const toReactProps = (props: Record<string, unknown>): Record<string, unknown> => {
  if (!("class" in props) && !("for" in props)) {
    return props;
  }
  const { class: className, for: htmlFor, ...rest } = props;
  return {
    ...rest,
    ...(className !== undefined && { className }),
    ...(htmlFor !== undefined && { htmlFor }),
  };
};
