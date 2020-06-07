import React, { useState, useEffect, ChangeEvent , FormEvent} from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';
import logo from '../../assets/logo.svg';
import useModal from '../ModalMessage/useModal';
import ModalMessage from '../ModalMessage';

import Dropzone from './../../compponents/Dropzone';


interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface UF {
    sigla: string;
}

interface Municipio {
    nome: string;
}


const CreatePoint = () => {
   
    const history = useHistory();

    const {isShowing, setShowingModal} = useModal();


    const [items, setItems] = useState<Item[]>([]);
    //será executado uma unica vez assim que o componente for criado, (didmount)
    useEffect(() => {
        api.get('items')
        .then( response => {            
             setItems(response.data) 
            });
    }, []);

    const [ufs, setUfs] = useState<string[]>([]);
    useEffect(() => {
        axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then( response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
            });
    }, []);

    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [municipios, setMunicipios] = useState<string[]>([]);
    useEffect(() => {
        axios.get<Municipio[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`)
        .then( response => {
            const municipios = response.data.map(municipio => municipio.nome);
            setMunicipios(municipios);
            });
    }, [selectedUF]); //Carregar as Cidades sempre que a UF alterar

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    const [inicialPosition, setInicialPosition] = useState<[number, number]>([0,0]);
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude, longitude } = position.coords;

            setInicialPosition([latitude, longitude]);
            setSelectedPosition([latitude, longitude]);
        })
    }, []); 


    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    const [formData, setFormData] = useState({
        name: '',
        email:'',
        whatsapp: '',
    })
    //Inputs
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;
        setFormData({...formData, [name]:value});
        
    }

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    function handleSelectItem(id:number){
        const alreadySelected = selectedItems.findIndex(item => item == id);
        if (alreadySelected >=0)
        {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }
        else {

            setSelectedItems([ ...selectedItems, id ])
        }

    }   

    async function handleSubmit(event: FormEvent){
        event.preventDefault(); //Evita que o form redirecione a rota automaticamente

        const {name, email, whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const saveData = new FormData(); 
        saveData.append('name',name); 
        saveData.append('email',email); 
        saveData.append('whatsapp', whatsapp);
        saveData.append('uf',uf); 
        saveData.append('city',city); 
        saveData.append('latitude', String(latitude)); 
        saveData.append('longitude', String(longitude)); 
        saveData.append('items', items.join(','));
        if (selectedFile)
        {
           saveData.append('image',selectedFile); 
        }

/*         const saveData = { 
            name, 
            email, 
            whatsapp,
            uf, 
            city, 
            latitude, 
            longitude, 
            items
        };
 */
        await api.post('points', saveData);
        setShowingModal();
        
    }

    const [selectedFile, setSelectedFile] = useState<File>();

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft></FiArrowLeft>
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <ModalMessage
                    isShowing={isShowing}
                    hide={setShowingModal}
                    message="Cadastro Concluído!"
                /> 
                <h1> Cadastro do <br/> ponto de coleta </h1>
                <Dropzone onFileUploated={setSelectedFile}/>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                            <label htmlFor="name">Nome da Entidade</label>
                            <input 
                                type="text"
                                name="name"
                                id="name"
                                onChange = {handleInputChange}
                                />
                        </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange = {handleInputChange}
                                />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange = {handleInputChange}
                                />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map center={inicialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>

                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf"
                                onChange={handleSelectUF} 
                                value={selectedUF} 
                            >
                                <option value="0">Selecione uma UF</option>
                                {
                                    ufs.map(uf => ( 
                                        <option key={uf} value={uf}> {uf} </option> 
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                            name="city" 
                            id="city"
                            onChange={handleSelectCity} 
                            value={selectedCity}
                            >
                                <option value="0">Selecione uma Cidade</option>
                                {
                                    municipios.map(cidade => ( 
                                        <option key={cidade} value={cidade}> {cidade} </option> 
                                    ))
                                }
                            </select>
                        </div>

                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {
                            items.map(item => (
                                <li 
                                key={item.id} 
                                onClick={() => handleSelectItem(item.id)}
                                className={selectedItems.includes(item.id)? 'selected' : ''}
                                >
                                    <img src={item.image_url} alt={item.title}/>
                                    <span>{item.title}</span>
                                </li>
                            ))
                        }
                        
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar Ponto de Coleta
                </button>
            </form>
        </div>
    );
}

export default CreatePoint;