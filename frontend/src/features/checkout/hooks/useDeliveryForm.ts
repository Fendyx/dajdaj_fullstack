import { useState, useEffect } from "react";
import { useGetUserProfileQuery } from "@/services/userApi";

interface DeliveryFormData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  method: string;
}

export function useDeliveryForm(token: string | null, initialEmail: string, accountName?: string) {
  const { data: userProfile } = useGetUserProfileQuery(undefined, { skip: !token });

  const [formData, setFormData] = useState<DeliveryFormData>({
    name: accountName || "",  // prefill с именем аккаунта сразу
    surname: "",
    email: initialEmail || "",
    phone: "",
    address: "",
    city: "",
    postal_code: "",
    method: "inpost",
  });

  useEffect(() => {
    if (!userProfile) return;

    const defaultId = userProfile.defaultDeliveryId;
    const deliveryDatas = userProfile.deliveryDatas || [];

    // Есть дефолтный профиль доставки — заполняем форму его данными
    if (defaultId !== null) {
      const defaultProfile = deliveryDatas.find((d: any) => d.deliveryId === defaultId);
      if (defaultProfile) {
        const pd = defaultProfile.personalData || {};
        const dl = defaultProfile.delivery || {};
        setFormData({
          name: pd.name || "",
          surname: pd.surname || "",
          email: pd.email || initialEmail || "",
          phone: pd.phone || "",
          address: dl.address || "",
          city: "",
          postal_code: "",
          method: dl.method || "inpost",
        });
        return;
      }
    }

    // Нет профиля доставки — подставляем только то, что знаем об аккаунте
    setFormData((prev) => ({
      ...prev,
      name: accountName || userProfile.name || prev.name,
      email: initialEmail || userProfile.email || prev.email,
    }));
  }, [userProfile, accountName, initialEmail]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Флаг: пользователь ещё не добавил ни одного профиля доставки
  const hasNoDeliveryProfile =
    token !== null &&
    userProfile !== undefined &&
    (userProfile.deliveryDatas?.length === 0 || userProfile.defaultDeliveryId === null);

  return {
    formData,
    handleInputChange,
    userProfile,
    hasNoDeliveryProfile,
  };
}