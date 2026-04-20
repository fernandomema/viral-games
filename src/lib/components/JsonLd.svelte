<script lang="ts">
	/**
	 * Atomic JSON-LD component for structured data.
	 * Usage: <JsonLd data={{ '@type': 'WebApplication', name: '...' }} />
	 * Wraps with @context automatically.
	 */
	let { data }: { data: Record<string, any> | Record<string, any>[] } = $props();

	const json = $derived(JSON.stringify(
		Array.isArray(data)
			? data.map(d => ({ '@context': 'https://schema.org', ...d }))
			: { '@context': 'https://schema.org', ...data }
	).replace(/<\/script/gi, '<\\/script'));
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${json}</script>`}
</svelte:head>
