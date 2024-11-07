"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from 'next/navigation'
import { useUser } from "@clerk/nextjs"
import { updateUserField } from '@/app/actions/User'
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from 'lucide-react'

export function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const { toast } = useToast()

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role)
  }

  const handleNext = async () => {
    if (!user?.id || !selectedRole) return;

    setIsLoading(true)
    try {
      await updateUserField(user.id, { role: selectedRole as 'host' | 'player' })
      
      if (selectedRole === "host") {
        router.push('/pricing')
      } else if (selectedRole === "player") {
        router.push('/join')
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update role. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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
          disabled={isLoading}
        >
          I&apos;m Host
        </Button>
        <Button
          variant={selectedRole === 'player' ? 'default' : 'outline'}
          className="w-full text-lg py-6"
          onClick={() => handleRoleSelect('player')}
          disabled={isLoading}
        >
          I&apos;m Player
        </Button>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          onClick={handleNext}
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Next'
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}