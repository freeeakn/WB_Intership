import { createFileRoute } from "@tanstack/react-router";
import AddCity from "../../../components/ui/AddCity";

export const Route = createFileRoute("/cities/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <AddCity />;
}
