import Swal from "sweetalert2";


export const ShowSuccesAlert = (title, text) => {
    Swal.fire({
        icon : "success",
        title : title,
        text : text
    });
};

export const ShowErrorAlter = (title, text) => {
    Swal.fire({
        icon : "error",
        title: title,
        text : text
    });
};

