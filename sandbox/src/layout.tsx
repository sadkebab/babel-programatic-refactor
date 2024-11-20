import { useQuery } from "react-query-old";

export function Layout() {
  const { data } = useQuery(
    async () => {
      return { value: "test" };
    },
    {
      queryKey: "layout",
    },
  );
}
