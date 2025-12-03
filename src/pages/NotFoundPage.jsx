// NotFoundPage.jsx
function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#333',
      }}
    >
      <h1
        style={{
          fontSize: '96px',
          lineHeight: 1,
          margin: 0,
          fontWeight: 'bold',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '32px',
          margin: '16px 0 8px',
          fontWeight: 'normal',
        }}
      >
        Not Found
      </h2>

      <p style={{ fontSize: '16px', margin: 0 }}>
        요청하신 페이지를 찾을 수 없습니다.
      </p>
    </div>
  );
}

export default NotFoundPage;
