export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>OracleStock AI</title>
      </head>
      <body style={{ margin: 0, backgroundColor: '#020617' }}>
        {children}
      </body>
    </html>
  )
}
 
