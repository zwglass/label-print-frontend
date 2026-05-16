export function Icon({ name }) {
  const icons = {
    folder: "M3 7h6l2 2h10v9a2 2 0 0 1-2 2H3z M3 7v13",
    file: "M14 2H6a2 2 0 0 0-2 2v16h16V8z M14 2v6h6 M12 11v6 M9 14h6",
    save: "M5 3h12l2 2v16H5z M8 3v6h8 M8 17h8",
    print: "M7 8V3h10v5 M7 17H5a2 2 0 0 1-2-2v-4h18v4a2 2 0 0 1-2 2h-2 M7 14h10v7H7z",
    refresh: "M20 6v5h-5 M4 18v-5h5 M18 9a7 7 0 0 0-12-3 M6 15a7 7 0 0 0 12 3",
    size: "M4 9V4h5 M20 15v5h-5 M4 15v5h5 M20 9V4h-5",
    qr: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v6h-2z M18 14h2v6h-2z",
    barcode: "M5 4v16 M9 4v16 M12 4v16 M16 4v16 M19 4v16",
    plus: "M12 5v14 M5 12h14",
    message: "M5 5h14v10H8l-3 4z M8 9h8 M8 12h5",
    send: "M4 5l16 7-16 7 3-7z M7 12h13",
    book: "M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z M5 4v16a3 3 0 0 1 3-3h11 M8 8h7 M8 12h6",
    link: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1 M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1",
    trash: "M4 7h16 M10 11v6 M14 11v6 M6 7l1 14h10l1-14 M9 7V4h6v3",
    move: "M12 3l3 3h-2v4h4V8l3 3-3 3v-2h-4v4h2l-3 3-3-3h2v-4H7v2l-3-3 3-3v2h4V6H9z",
    lens: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z M7 12h10 M9 9l-3 3 3 3 M15 9l3 3-3 3",
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d={icons[name]} />
    </svg>
  );
}
