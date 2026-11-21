export default function StudentTable({ siswa }) {
    return (
        <>
            <div className="page-head">
                <p className="eyebrow">Jurusan RPL</p>
                <h1 className="page-title">Data Siswa</h1>
            </div>

            <section className="panel table-panel" aria-label="Data siswa">
                <div className="table-scroll">
                    <table className="student-table">
                        <thead>
                            <tr>
                                <th className="col-no">No</th>
                                <th>Nama</th>
                                <th>Jenis Kelamin</th>
                                <th>Kelas</th>
                                <th>Agama</th>
                            </tr>
                        </thead>
                        <tbody>
                            {siswa.map((s, index) => (
                                <tr key={`${s.kelas}-${s.nama}-${index}`}>
                                    <td className="col-no">{index + 1}</td>
                                    <td className="cell-name">{s.nama}</td>
                                    <td>{s.jk}</td>
                                    <td>{s.kelas}</td>
                                    <td>{s.agama}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}
