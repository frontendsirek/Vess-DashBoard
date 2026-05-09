import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function LogoutPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/auth/sign-in', { replace: true })
  }, [navigate])
  return null
}
