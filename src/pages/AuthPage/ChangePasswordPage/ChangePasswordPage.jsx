import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePasswordRequest } from "../../../redux/actions/changePasswordActions";
import { MESSAGES } from "./string";
import { validatePassword } from "./utils";

const ChangePasswordPage = ({ onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, successMessage, errorMessage } = useSelector(
    (state) => state.changePassword
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setLocalErrorMessage(MESSAGES.PASSWORD_VALIDATION);
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalErrorMessage("Incorrect confirm password, Please try again");
      return;
    }

    if (oldPassword === "") {
      setLocalErrorMessage("Please enter your old password");
      return;
    }

    dispatch(changePasswordRequest(oldPassword, newPassword));
  };

  useEffect(() => {
    if (successMessage) {
      setLocalErrorMessage("");
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      setLocalErrorMessage(errorMessage);
    }
  }, [errorMessage]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Change Password
      </h2>
      <form onSubmit={handlePasswordChange} data-testid="change-password-form">
        <div className="mb-4">
          <label
            htmlFor="oldPassword"
            className="block text-sm font-medium text-gray-700"
          >
            OLD PASSWORD
          </label>
          <input
            type="password"
            id="oldPassword"
            value={oldPassword}
            data-testid="old-password-input"
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            NEW PASSWORD
          </label>
          <input
            type="password"
            id="newPassword"
            data-testid="new-password-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700"
          >
            CONFIRM NEW PASSWORD
          </label>
          <input
            type="password"
            id="confirmPassword"
            data-testid="confirm-password-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {localErrorMessage && (
          <div className="text-red-500 text-sm mb-4">{localErrorMessage}</div>
        )}

        <button
          type="submit"
          className={`px-6 py-2 font-semibold rounded-md w-full transition duration-300 ${
            !newPassword || isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isLoading}
        >
          {isLoading ? "In Progress..." : "CONTINUE"}
        </button>
      </form>

      <button
        onClick={onClose}
        className="mt-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-md w-full"
      >
        {MESSAGES.CANCEL}
      </button>
    </div>
  );
};

export default ChangePasswordPage;
