import { Checkbox } from "@/components/ui/checkbox";

export default function ListPageTemplate() {
  const items = [
    { id: "ITEM-001", status: "Active", date: "2024-07-28" },
    { id: "ITEM-002", status: "Inactive", date: "2024-07-27" },
    { id: "ITEM-003", status: "Active", date: "2024-07-26" },
    { id: "ITEM-004", status: "Pending", date: "2024-07-25" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">List/Table Page Template</h1>
      <div className="vx-card p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="p-4 text-left w-12"><Checkbox id="select-all" /></th>
                <th className="p-4 text-left font-semibold">ID</th>
                <th className="p-4 text-left font-semibold">Status</th>
                <th className="p-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="vx-table-row border-t border-white/10" data-state={index === 1 ? 'selected' : 'unselected'}>
                  <td className="p-4"><Checkbox id={`select-${item.id}`} /></td>
                  <td className="p-4">{item.id}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Active' ? 'chip-info' : 'chip-alert'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
