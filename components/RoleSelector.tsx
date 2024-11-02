"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs";
import { updateUserField } from '@/app/actions/User'

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useUser()

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
  }

  const handleNext = async () => {
    if (user?.id && selectedRole) {
      await updateUserField(user.id, { role: selectedRole as 'host' | 'player' })
    }
    
    if (selectedRole === "host") {
      router.push('/pricing')
    } else if (selectedRole === "player") {
      router.push('/join')
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Choose your role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant={selectedRole === 'host' ? 'default' : 'outline'}
          className="w-full text-lg py-6"
          onClick={() => handleRoleSelect('host')}
        >
          I&apos;m Host
        </Button>
        <Button
          variant={selectedRole === 'player' ? 'default' : 'outline'}
          className="w-full text-lg py-6"
          onClick={() => handleRoleSelect('player')}
        >
          I&apos;m Player
        </Button>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleNext}
          disabled={!selectedRole}
        >
          Next
        </Button>
      </CardFooter>
    </Card>
  )
}