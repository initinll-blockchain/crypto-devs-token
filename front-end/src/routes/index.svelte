<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import cryptoDevs from '$lib/assets/0.svg';

	import {
		connectWallet,
		getNetwork,
		switchNetwork,
		onChainChanged,
		checkIfWalletIsConnected,
		getERC20TokenBalance,
		getTotalERC20TokensMinted,
        getERC721TokensToBeClaimed,
        claimERC20Tokens,
        mintERC20Tokens
	} from '$lib/services/CryptoDevsTokenService';

    let loading: boolean = false;
	let account: String;
	let network: String;
	let erc20TokenBalance: number;
	let erc20TokensMinted: number;
    let erc721TokensToBeClaimed: number;
    let tokenAmount: number;

	onMount(async () => {
		try {
            loading = true;
			account = await checkIfWalletIsConnected();
			network = await getNetwork();
			onChainChanged(handleChainChanged);
			await loadData();
            loading = false;
		} catch (error) {
			console.log('OnMount Error', error);
		}
	});

	async function loadData() {		
		erc20TokenBalance = await getERC20TokenBalance();
		erc20TokensMinted = await getTotalERC20TokensMinted();
        erc721TokensToBeClaimed = await getERC721TokensToBeClaimed();
	}

	async function connect() {
        loading = true;
		account = await connectWallet();
        await loadData();
        loading = false;
	}

	function handleChainChanged(_chainId) {
		window.location.reload();
	}
</script>

<div>
	<div class="main">
		<div>
			<h1 class="title">Welcome to Crypto Devs ICO!</h1>
			<div class="description">You can claim or mint Crypto Dev tokens here</div>
			{#if network !== undefined && network !== 'Rinkeby'}
				<div class="">
					<p>Please connect to the Polygon Mumbai Testnet</p>
					<button class="button" on:click={async () => await switchNetwork('0x4')}
						>Click here to switch</button
					>
				</div>
			{:else if account}
				<div>
					<div class="description">
						You have minted {erc20TokenBalance} Crypto Dev Tokens
					</div>
					<div class="description">
						Overall {erc20TokensMinted}/10000 have been minted!!!
					</div>
					<!-- {renderButton()} -->
                    {#if loading}
                        <div>
                            <button class="button">Loading...</button>
                        </div>
                    {:else if erc721TokensToBeClaimed > 0}
                        <div>
                            <div class="description">
                            {erc721TokensToBeClaimed * 10} Tokens can be claimed!
                            </div>
                            <button class="button" on:click={claimERC20Tokens}>
                            Claim Tokens
                            </button>
                        </div>
                    {:else}
                        <div style="display: 'flex-col'">
                            <div>
                                <input type="number" placeholder="Amount of Tokens" bind:value={tokenAmount} class="input"/>
                            </div>                    
                            <button class="button" disabled={!(tokenAmount > 0)} on:click={() => mintERC20Tokens(tokenAmount)}>
                                Mint Tokens
                            </button>
                        </div>
                    {/if}
				</div>
			{:else}
				<button on:click={connect} class="button">Connect your wallet</button>
			{/if}
		</div>
		<div>
			<img class="image" alt="" src={cryptoDevs} />
		</div>
	</div>
	<footer class="footer">Made with &#10084; by Crypto Devs</footer>
</div>
