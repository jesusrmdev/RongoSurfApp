"use client";

import { useState } from "react";
import EditUserModal from "./EditUserModal";

type UserData = {
  id: string;
  name: string;
  apellido1: string;
  apellido2: string;
  phone: string;
  weight: number;
  height: number;
  wetsuitSize: string;
};

export default function EditUserButton({ user }: { user: UserData }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="text-xs text-ocean hover:text-ocean-dark font-medium"
      >
        Editar
      </button>
      {show && <EditUserModal user={user} onClose={() => setShow(false)} />}
    </>
  );
}
