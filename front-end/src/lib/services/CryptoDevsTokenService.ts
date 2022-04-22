import { BigNumber, Contract, ethers, Signer, utils, type ContractInterface, type ContractTransaction } from 'ethers';
import abi_nft from '$lib/abi/CryptoDevs.json';
import abi_token from '$lib/abi/CryptoDevsToken.json';
import { Constants } from '$lib/helpers/Constants';
import { Networks } from '$lib/helpers/Networks';

declare const window: any;

export async function checkIfWalletIsConnected(): Promise<string> {
    let account:string;

    try {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have metamask!");
            return;
        } else {
            console.log("We have the ethereum object", ethereum);
        }

        const accounts: string[] = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;            
        } else {
            console.log("No authorized account found")
        }
    } catch (error) {
        throw error;
    }
}

export async function connectWallet(): Promise<string> {
    let account:string;

    try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Make sure you have metamask!");
            return;
        }

        const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });

        if (accounts.length !== 0) {
            account = accounts[0];
            console.log("Found an authorized account:", account);
            return account;            
        } else {
            console.log("No authorized account found")
        }     
    } catch (error) {
        throw error;
    }
}

export async function getNetwork(): Promise<string> {
    let network: string;

     try {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Make sure you have metamask!");
            return;
        }

        const chainId = await ethereum.request({ method: 'eth_chainId'});        
        network = Networks[chainId];
    } catch (error) {
        throw error;
    }

    return network;
}

export async function switchNetwork(chainId: string): Promise<void> {
    try {
        const { ethereum } = window;

        if (ethereum) {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainId }],
            });
        }
        else {
            alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
        }
    } catch (error) {
        throw error;
    }
}

export async function getOwner(): Promise<boolean> {
    let result:boolean = false;

    try {
        const cryptoDevsTokenContract = getContract_token();
        const contractOwnerAddress: string = await cryptoDevsTokenContract.owner();
        const signer = getSigner();
        let signerAddress = await signer.getAddress();

        if (contractOwnerAddress.toLowerCase() === signerAddress.toLowerCase()) {
            result = true;
        }

    } catch (error) {
        console.error(error);
    }
    return result;
}

export async function getERC721TokensToBeClaimed ():Promise<number> {
    let erc721TokensToBeClaimed: number;

    try {
        const cryptoDevsNFTContract = getContract_nft();
        const cryptoDevsTokenContract = getContract_token();
        const signerAddress = await getSigner().getAddress();
        const erc721Balance = await cryptoDevsNFTContract.balanceOf(signerAddress);
        const bigNumberZero = BigNumber.from(0);

        if (erc721Balance === bigNumberZero) {
            erc721TokensToBeClaimed = 0;
        }
        else {
            for (let tokenIndex = 0; tokenIndex < erc721Balance; tokenIndex++) {
                const erc721TokenId = cryptoDevsNFTContract.tokenOfOwnerByIndex(signerAddress, tokenIndex);
                const isErc721TokenIdClaimed = cryptoDevsTokenContract.erc721_tokenIds_claimed(erc721TokenId);
                if(!isErc721TokenIdClaimed) {
                    erc721TokensToBeClaimed ++;
                }
            }
        }

    } catch (error) {
        console.error("getERC20TokenBalance", error);
    }

    return erc721TokensToBeClaimed;
}

export async function getERC20TokenBalance ():Promise<number> {
    let erc20TokenBalance: number;

    try {
        const cryptoDevsTokenContract = getContract_token();
        const signerAddress = await getSigner().getAddress();
        erc20TokenBalance = await cryptoDevsTokenContract.balanceOf(signerAddress);
    } catch (error) {
        console.error("getERC20TokenBalance", error);
    }

    return erc20TokenBalance;
}

export async function mintERC20Tokens(erc20TokenQuantity: number) {
    try {
        const cryptoDevsTokenContract = getContract_token();
        
        const erc20TokenPrice = 0.001;
        const mintPrice = erc20TokenPrice * erc20TokenQuantity;

        const txn = await cryptoDevsTokenContract.mint(erc20TokenQuantity, {
            value: utils.parseEther(mintPrice.toString())
        });
        await txn.wait();

        alert("Sucessfully minted Crypto Dev Tokens");
    } catch (error) {
        console.error("mintERC20Tokens", error);
    }
}

export async function claimERC20Tokens() {
    try {
        const cryptoDevsTokenContract = getContract_token();
        

        const txn = await cryptoDevsTokenContract.claim();
        await txn.wait();

        alert("Sucessfully claimed Crypto Dev Tokens");
    } catch (error) {
        console.error("mintERC20Tokens", error);
    }
}

export async function getTotalERC20TokensMinted():Promise<number> {
    var TotalERC20TokensMinted = 0;

    try {
        const cryptoDevsTokenContract = getContract_token();
        TotalERC20TokensMinted = cryptoDevsTokenContract.totalSupply();
    } catch (error) {
        console.error("getTotalERC20TokensMinted", error);
    }  

    return TotalERC20TokensMinted;
}

function getContract_nft(): Contract {
    let cryptoDevsNFTContract: Contract;

    try {
        const signer: Signer = getSigner();
        let contractABI: ContractInterface = abi_nft.abi;
        let contractAddress: string = Constants.NFT_CONTRACT_ADDRESS_RINKEBY;

        if (signer) {
            cryptoDevsNFTContract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("CryptoDevsTokenContract", cryptoDevsNFTContract.address);
        }
    } catch (error) {
        console.log("getContract_nft", error);
    }

    return cryptoDevsNFTContract;
}

function getContract_token(): Contract {
    let cryptoDevsTokenContract: Contract;

    try {
        const signer: Signer = getSigner();
        let contractABI: ContractInterface = abi_token.abi;
        let contractAddress: string = Constants.TOKEN_CONTRACT_ADDRESS_RINKEBY;

        if (signer) {
            cryptoDevsTokenContract = new ethers.Contract(contractAddress, contractABI, signer);
            console.log("CryptoDevsTokenContract", cryptoDevsTokenContract.address);
        }
    } catch (error) {
        console.log("getContract_token", error);
    }

    return cryptoDevsTokenContract;
}

function getSigner(): Signer {
    let signer: Signer;

    try {
        const { ethereum } = window;

        if (ethereum) {
            const provider: ethers.providers.Web3Provider = new ethers.providers.Web3Provider(ethereum);
            signer = provider.getSigner();            
        }        
    } catch (error) {
        console.log("getSigner", error);
    }

    return signer;
}

