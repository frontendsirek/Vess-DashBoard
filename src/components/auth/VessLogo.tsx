interface VessLogoProps {
  className?: string
}

export function VessLogo({ className = '' }: VessLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 97 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 2.5L8.5 25.5H12L20 2.5H16L10.25 20.5L4.5 2.5H0.5Z"
        fill="currentColor"
      />
      <path
        d="M24 25.5V2.5H38V6H28V12H36.5V15.5H28V22H38.5V25.5H24Z"
        fill="currentColor"
      />
      <path
        d="M50.5 26C47.5 26 45.2 25.2 43.5 23.5L45.5 20.5C47 22 49 22.5 50.8 22.5C53 22.5 54.5 21.5 54.5 19.8C54.5 18.2 53.5 17.5 50.5 16.8C46.5 15.8 44 14.5 44 11C44 7.2 47 5 51 5C54 5 56 6 57.5 7.5L55.5 10.5C54.2 9.2 52.5 8.5 51 8.5C49 8.5 47.8 9.5 47.8 11C47.8 12.5 49 13.2 52 14C56 15 58.3 16.5 58.3 19.8C58.3 23.8 55 26 50.5 26Z"
        fill="currentColor"
      />
      <path
        d="M68.5 26C65.5 26 63.2 25.2 61.5 23.5L63.5 20.5C65 22 67 22.5 68.8 22.5C71 22.5 72.5 21.5 72.5 19.8C72.5 18.2 71.5 17.5 68.5 16.8C64.5 15.8 62 14.5 62 11C62 7.2 65 5 69 5C72 5 74 6 75.5 7.5L73.5 10.5C72.2 9.2 70.5 8.5 69 8.5C67 8.5 65.8 9.5 65.8 11C65.8 12.5 67 13.2 70 14C74 15 76.3 16.5 76.3 19.8C76.3 23.8 73 26 68.5 26Z"
        fill="currentColor"
      />
    </svg>
  )
}
