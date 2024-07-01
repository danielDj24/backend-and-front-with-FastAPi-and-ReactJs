import Swal from "sweetalert2";


export const ShowSuccesAlert = (title, text) => {
    return Swal.fire({
        icon : "success",
        title : title,
        text : text
    });
};

export const ShowErrorAlter = (title, text) => {
    return Swal.fire({
        icon : "error",
        title: title,
        text : text
    });
};

