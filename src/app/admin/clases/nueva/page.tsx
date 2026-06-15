import { requireAdmin } from "@/lib/dal";
import NewClassForm from "./NewClassForm";

export const dynamic = "force-dynamic";

export default async function NewClassPage() {
  await requireAdmin();
  return <NewClassForm />;
}
