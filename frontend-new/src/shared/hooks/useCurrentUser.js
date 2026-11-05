import { useCallback, useEffect, useState } from "react";
import { clearAccessToken } from "../services/api";
import { getCurrentUser, updateCurrentUser } from "../services/authService";

async function requestCurrentUser() {
  try {
    return { user: await getCurrentUser(), error: "" };
  } catch (err) {
    if (err.status === 401) {
      clearAccessToken();
    }

    return {
      user: null,
      error: err.message || "Không thể tải hồ sơ.",
    };
  }
}

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reloadUser = useCallback(async () => {
    setLoading(true);
    setError("");

    const result = await requestCurrentUser();
    setUser(result.user);
    setError(result.error);
    setLoading(false);
    return result.user;
  }, []);

  useEffect(() => {
    let active = true;

    // Hàm request không đụng state; effect chỉ cập nhật giao diện khi request hoàn tất.
    requestCurrentUser().then((result) => {
      if (active) {
        setUser(result.user);
        setError(result.error);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async (name, phone) => {
    setError("");

    try {
      const updatedUser = await updateCurrentUser(name, phone);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || "Không thể cập nhật hồ sơ.");
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    reloadUser,
    saveProfile,
  };
}
