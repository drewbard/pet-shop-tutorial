class App {
	constructor() {
		this.web3Provider = null;
		this.contracts = {};
		this.onAdoptButtonClicked = this.onAdoptButtonClicked.bind(this);
		
		this._initAsync()
			.then(() => console.info('App Loaded Successfully'))
			.catch(error => console.error(error.message));
	}
	
	async _initAsync() {
		const pets = await this._loadPetsAsync('../pets.json');
		this._populateUIWith(pets);
		this._initWeb3();
		await this._initAdoptionContractAsync();
		await this._updateUIWithAdoptedPets();
		this._bindUIEvents();
	}
	
	_populateUIWith(pets) {
		const petsList = $('#petsRow');
		
		pets.forEach((pet) => {
			const petComponent = this._buildPetHTMLComponentWith(pet);
			petsList.append(petComponent);
		});
	}
	
	_buildPetHTMLComponentWith(pet) {
		const petTemplate = $('#petTemplate');
		
		petTemplate.find('.panel-title').text(pet.name);
		petTemplate.find('img').attr('src', pet.picture);
		petTemplate.find('.pet-breed').text(pet.breed);
		petTemplate.find('.pet-age').text(pet.age);
		petTemplate.find('.pet-location').text(pet.location);
		petTemplate.find('.btn-adopt').attr('data-id', pet.id);
		
		return petTemplate.html();
	}
	
	_initWeb3() {
		const web3Provider = this._getWeb3Provider();
		this.web3Provider = web3Provider;
		window.web3 = new window.Web3(web3Provider);
	}
	
	_getWeb3Provider() {
		const web3IsDefined = !!window.web3;
		
		if (web3IsDefined) {
			return window.web3.currentProvider;
		} else {
			// Fallback to the TestRPC
			return new Web3.providers.HttpProvider('http://localhost:8545');
		}
	}
	
	async _initAdoptionContractAsync() {
		const adoptionArtifact = await this._loadAdoptionArtifactAsync();
		
		// Instantiate adoption contract with truffle-contract
		this.contracts.Adoption = window.TruffleContract(adoptionArtifact);
		
		// Set the provider for our contract
		this.contracts.Adoption.setProvider(this.web3Provider);
	}
	
	_loadPetsAsync(path) {
		return new Promise((resolve, reject) => {
			$.getJSON(path)
				.done(resolve)
				.fail(reject);
		});
	}
	
	_loadAdoptionArtifactAsync() {
		return new Promise((resolve, reject) => {
			$.getJSON('Adoption.json')
				.done(resolve)
				.fail(reject);
		});
	}
	
	_bindUIEvents() {
		$(document).on('click', '.btn-adopt', this.onAdoptButtonClicked);
	}
	
	async _getOwnersAsync() {
		try {
			const deployedAdoptionInstance = await this.contracts.Adoption.deployed();
			return deployedAdoptionInstance.getAdopters.call();
		} catch (error) {
			throw error;
		}
	}
	
	_markPetPanelToAdopted(petIndex) {
		const petPanels = document.getElementsByClassName('panel-pet');
		
		const petPanelButton = petPanels[petIndex].getElementsByTagName('button')[0];
		const shouldUpdate = petPanelButton.innerHTML !== 'Success';
		
		if(shouldUpdate) {
			petPanelButton.innerText = 'Success';
			petPanelButton.disabled = true;
		}
	}
	
	async _updateUIWithAdoptedPets() {
		const owners = await this._getOwnersAsync();
		
		owners.forEach((address, ownerIndex) => {
			
			const hasOwner = address !== '0x0000000000000000000000000000000000000000';
			
			if (hasOwner) {
				this._markPetPanelToAdopted(ownerIndex);
			}
		});
	}
	
	_getAccountsAsync() {
		return new Promise((resolve, reject) => {
			web3.eth.getAccounts((error, accounts) => {
				if (error) {
					reject(error)
				}
				
				resolve(accounts);
			});
		});
	}
	
	async _adoptPetAsync(petId) {
		const accounts = await this._getAccountsAsync();
		const fromAccount = accounts[0];
		const adoptionInstance = await this.contracts.Adoption.deployed();
		
		// Execute adopt as a transaction by sending account
		return adoptionInstance.adopt(petId, {from: fromAccount});
	}
	
	async _adoptPet(petId) {
		await this._adoptPetAsync(petId);
		await this._updateUIWithAdoptedPets();
	}
	
	onAdoptButtonClicked(event) {
		event.preventDefault();
		
		const petId = parseInt($(event.target).data('id'));
		
		this._adoptPet(petId)
			.then(() => console.info('Successfully adopted'))
			.catch(console.error);
	}
}

$(function () {
	$(window).load(function () {
		window.app = new App();
	});
});
