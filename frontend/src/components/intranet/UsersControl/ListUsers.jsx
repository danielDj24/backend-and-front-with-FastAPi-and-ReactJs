import React, {useEffect, useState} from "react";
import { axiosInstanceAuth, activateUser, activateUserPreferencial, deleteUser } from "../../functions/axiosConfig";
import useAuthStore from "../../store/userAuthToken";
import { ShowErrorAlter, ShowSuccesAlert } from '../../functions/Alerts';
import { ConfirmationModal } from "../../functions/CustomModal";
import Layout from "../../../routes/LayoutControl/Layouts";
import "./usersList.css"


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    //estados para el buscador
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [activeFilter, setActiveFilter] = useState("");
    const [roleFilter, setRoleFilter] = useState("");   

    const [setError] = useState(null);
    const {token, checkToken } = useAuthStore();
    const [showModal, setShowModal] = useState(false);
    const [modalAction, setModalAction] = useState(null);
    const [userIdToModify, setUserIdToModify] = useState(null);
    const [modalMessage, setModalMessage] = useState("");

    
    const FetchUsers = async () => {
        if (token) {
            const axiosAuth = axiosInstanceAuth(token);
            try{
                const response = await axiosAuth.get("/users")
                setUsers(response.data);
                setFilteredUsers(response.data);
            }catch (err){
                setError(err.response ? err.response.data.detail: "Error fetching users");
            }
        } 
    };
    
    useEffect(() => {
        checkToken();

    },[checkToken]);

    useEffect(() => {
        FetchUsers();
    }, [token]);

    const handleOpenModal = (userId, action) => {
        setUserIdToModify(userId);
        setModalAction(action);
        setModalMessage(
            action === 'activate'
                ? '¿Estás seguro de activar este usuario?'
                : action === 'preferential'
                ? '¿Estás seguro de hacer de este usuario un cliente preferencial?'
                : '¿Estás seguro de eliminar este usuario?'
        );        
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmModal = async () => {
        setShowModal(false);
        try {
            if (modalAction === 'activate') {
                const activatedUser = await activateUser(token, userIdToModify);
                setUsers(users.map((user) => (user.id === userIdToModify ? activatedUser : user)));
                ShowSuccesAlert("Usuario Activado", "El usuario se activó correctamente.");
            
            } else if (modalAction === 'preferential') {
                const updatedUser = await activateUserPreferencial(token, userIdToModify);
                setUsers(users.map((user) => (user.id === userIdToModify ? updatedUser : user)));
                ShowSuccesAlert("Usuario Actualizado", "El usuario ahora es cliente preferencial.");
                
            }else if (modalAction === 'delete'){
                await deleteUser(token, userIdToModify);
                setUsers(users.filter((user) => user.id !== userIdToModify));
                ShowSuccesAlert("Usuario Eliminado", "El usuario se eliminó correctamente.");
            }
            FetchUsers();
        } catch (err) {
            setError(err.response ? err.response.data.detail : `Error ${modalAction === 'activate' ? 'activating' : 'deleting'} user`);
            ShowErrorAlter("Error", `No se pudo ${modalAction === 'activate' ? 'activar' : 'eliminar'} el usuario.`);
        }
    };
    
    const handleFilter = () => {
        const filtered = users.filter(user =>
            (user.role && user.role.toLowerCase().includes(roleFilter.toLowerCase()) || roleFilter === "") &&
            ((user.is_active && activeFilter === "active") ||
            (!user.is_active && activeFilter === "inactive") ||
            activeFilter === "")
        );
        setFilteredUsers(filtered);
    };

    useEffect(() => {
        handleFilter();
    }, [users, activeFilter, roleFilter]);

    return(
        <div>
            <div className="container">
            <div className="background-user-container">

                <h1 className="text-center my-4">Lista de usuarios</h1>
                <Layout/>

                <div className="mb-3">
                    <div className="d-flex mb-2">
                        <select className="form-select me-2" onChange={(e) => setActiveFilter(e.target.value)}>
                            <option value="">Todos</option>
                            <option value="active">Activos</option>
                            <option value="inactive">Inactivos</option>
                        </select>
                        <select className="form-select" onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="">Todos los roles</option>
                            <option value="admin">Administradores</option>
                            <option value="client">Clientes</option>
                        </select>
                    </div>
                </div>
                <div className="list-group">
                    {filteredUsers.map((user) => (
                        <UserDetails key={user.id} user={user} onActivate={() => handleOpenModal(user.id, 'activate')} onPreferential={() => handleOpenModal(user.id, 'preferential')} onDelete={() => handleOpenModal(user.id, 'delete')} />
                        ))}
                </div>
            </div>
            <ConfirmationModal
                show={showModal}
                handleClose={handleCloseModal}
                handleConfirm={handleConfirmModal}
                message={modalMessage}
            />
        </div>
    </div>
    );
};
const UserDetails = ({ user, onActivate, onPreferential, onDelete  }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDetails = () => {
        setIsOpen(!isOpen); 
    };

    return (
        <div className="list-group-item">
            <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-1" onClick={toggleDetails} style={{ cursor: 'pointer' }}>
                    {user.username} <FontAwesomeIcon icon={faAngleDown} />
                </h5>
                <div className="btn-group" role="group">
                    {!user.is_active && (
                        <button className="btn btn-warning" onClick={() => onActivate(user.id)}>¿Activar Usuario?</button>
                    )}
                    {!user.preferencial_client  && (
                        <button className="btn btn-success mx-1" onClick={() => onPreferential(user.id)}>¿Volver preferencial?</button>
                    )}
                    <button className="btn btn-danger" onClick={() => onDelete(user.id)}>Eliminar Usuario</button>
                </div>
            </div>
            {isOpen && (
                <div className="mt-3">
                    <table className="user-details-table">
                        <tbody>
                            <tr>
                                <th>Correo:</th>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <th>Telefono:</th>
                                <td>{user.phone}</td>
                            </tr>
                            <tr>
                                <th>Dirección:</th>
                                <td>{user.address}</td>
                            </tr>
                            <tr>
                                <th>Nombre de la compañia:</th>
                                <td>{user.name_company}</td>
                            </tr>
                            <tr>
                                <th>NIT de la compañia:</th>
                                <td>{user.nit_company}</td>
                            </tr>
                            <tr>
                                <th>Estado:</th>
                                <td>{user.is_active ? 'activo' : 'inactivo'}</td>
                            </tr>
                            <tr>
                                <th>¿Es cliente preferencial?:</th>
                                <td>{user.preferencial_client ? 'si' : 'no'}</td>
                            </tr>
                            <tr>
                                <th>Rol:</th>
                                <td>{user.role}</td>
                            </tr>
                            {user.rut_company && (
                                <tr>
                                    <th>RUT de la compañia:</th>
                                    <td>
                                        <div className="pdf-viewer">
                                            <embed src={`http://127.0.0.1:8000/${user.rut_company}`} width="100%" height="400px" type="application/pdf" />
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UsersList;
