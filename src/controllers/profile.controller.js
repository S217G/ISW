import { handleSuccess, handleErrorServer, handleErrorClient } from "../Handlers/responseHandlers.js";
import { 
  updateUser, 
  deleteUser, 
 } from "../services/user.service.js";
import { updateUserValidation } from "../../validations/user.validation.js";

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "Hola, Este es un perfil publico.",
  });
}

export function getPrivateProfile(req, res) {
  const user = req.user;

  handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
    message: `Hola, ${user.email} Este es tu perfil privado.`,
    userData: user,
  });
}

export async function updatePrivateProfile(req, res) {
  try {
    const { error, value } = updateUserValidation.validate(req.body);
    
    if (error) {
      return handleErrorClient(res, 400, "Error en los datos enviados", error.details[0].message);
    }

    const userId = req.user.id;
    const { email, password } = value;

    const updatedUser = await updateUser(userId, { email, password });

    const { password: _, ...userWithoutPassword } = updatedUser;

    handleSuccess(res, 200, "Perfil actualizado exitosamente", {
      user: userWithoutPassword
    });

  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}

export async function deletePrivateProfile(req, res) {
  try {
    const userId = req.user.id;

    await deleteUser(userId);

    handleSuccess(res, 200, "Cuenta eliminada exitosamente", {
      message: "Tu cuenta ha sido eliminada permanentemente"
    });

  } catch (error) {
    if (error.message === "Usuario no encontrado") {
      return handleErrorClient(res, 404, "Usuario no encontrado");
    }
    handleErrorServer(res, 500, "Error interno del servidor", error.message);
  }
}
