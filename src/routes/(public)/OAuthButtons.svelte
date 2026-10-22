<script lang="ts">
	import KeyIcon from '~icons/lucide/key-round';
	import type { OAuthProvider } from '#lib/server/auth.ts';
	import GithubIcon from '~icons/simple-icons/github';
	import GoogleIcon from '~icons/simple-icons/google';
	import { authClient } from '#lib/auth-client.ts';
	import { Button } from '#lib/components/ui/button/index.js';
	import * as Field from '#lib/components/ui/field/index.js';

	const PROVIDER_ICONS = {
		github: GithubIcon,
		google: GoogleIcon,
		oidc: KeyIcon
	};

	let { providers, next }: { providers: OAuthProvider[]; next: string } = $props();

	let pending = $state<OAuthProvider["id"] | null>(null);

	async function signIn(provider: OAuthProvider["id"]) {
		pending = provider;
		// Redirects to the provider; we only come back here on an error.
		await authClient.signIn.social({
			provider,
			callbackURL: next,
			errorCallbackURL: `/login?next=${encodeURIComponent(next)}`
		});
		pending = null;
	}
</script>

{#if providers.length}
	{#each providers as provider (provider.id)}
		{@const Icon = PROVIDER_ICONS[provider.id]}
		<Button variant="outline" type="button" disabled={!!pending} onclick={() => signIn(provider.id)}>
			<Icon />Continue with {provider.name}
		</Button>
	{/each}
	<Field.Separator class="*:data-[slot=field-separator-content]:bg-card">or</Field.Separator>
{/if}
