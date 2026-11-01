export async function getIsCheckInEnabled() {
  const spaceId = process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID;
  const environment = process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT;
  const accessToken = process.env.NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN;
  if (!spaceId || !environment || !accessToken) {
    throw new Error(
      'Contentful check-in feature flag configuration is missing.',
    );
  }
  const url = new URL(
    `https://cdn.contentful.com/spaces/${encodeURIComponent(spaceId)}/environments/${encodeURIComponent(environment)}/entries`,
  );
  url.searchParams.set('content_type', 'featureFlag');
  url.searchParams.set('fields.name', 'ENABLE_CHECK_IN');
  url.searchParams.set('limit', '2');
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(
      `Unable to read Contentful check-in flag (${response.status}).`,
    );
  }
  const items = result.items;
  if (
    result.total !== 1 ||
    items?.length !== 1 ||
    typeof items[0]?.fields?.value !== 'boolean'
  ) {
    throw new Error(
      'Contentful must contain one boolean ENABLE_CHECK_IN flag.',
    );
  }
  return items[0].fields.value;
}
