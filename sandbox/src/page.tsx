import { useQuery } from "react-query-old";

export function Page() {
  const { data } = useQuery(
    async () => {
      return { value: "test" };
    },
    {
      queryKey: "page",
    },
  );
}
