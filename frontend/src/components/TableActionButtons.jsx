const TableActionButtons = ({ onEdit, onDelete, editLabel = 'Edit', deleteLabel = 'Delete' }) => (
  <div className="flex flex-wrap items-center gap-2">
    <button
      type="button"
      onClick={onEdit}
      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
    >
      {editLabel}
    </button>
    <button
      type="button"
      onClick={onDelete}
      className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100"
    >
      {deleteLabel}
    </button>
  </div>
);

export default TableActionButtons;
