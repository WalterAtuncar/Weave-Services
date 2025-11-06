import { Login, ForgotPassword } from "@/components/templates/Login";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AlertProvider } from "@/components/ui/alerts/AlertProvider";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const handleLoginSuccess = () => {

    // Marcar que viene desde login para forzar ir a home
    localStorage.setItem('fromLogin', 'true');
    // Redirigir a la aplicación principal
    navigate('/app');
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Variantes de animación para el contenedor de logos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.6,
      }
    }
  } as const;

  // Variantes para el logo principal
  const logoMainVariants = {
    hidden: { 
      opacity: 0, 
      y: -30, 
      scale: 0.8 
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        ease: [0.25, 0.25, 0.25, 0.75] as const,
      }
    }
  } as const;

  // Variantes para el logo secundario
  const logoSecondaryVariants = {
    hidden: { 
      opacity: 0, 
      x: -50, 
      scale: 0.9 
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 1.0,
        ease: [0.25, 0.25, 0.25, 0.75] as const,
      }
    }
  } as const;

  // Variantes para hover
  const hoverVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  return (
    <AlertProvider>
    <div 
      className={styles.loginPage}
      style={{ backgroundColor: colors.background }}
    >
      {/* Theme Toggle Button */}
      <ThemeToggle />
      
      {/* Logos Section con animaciones */}
      <motion.div 
        className={styles.logosContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo principal con animación */}
        <motion.div 
          className={styles.logoMainContainer}
          variants={logoMainVariants}
        >
          <motion.img 
            src={colors.logo.main}
            alt="Weave Logo" 
            className={styles.logoMain}
            whileHover={{ 
              scale: 1.05,
              filter: "drop-shadow(0 8px 16px rgba(22, 24, 39, 0.15))"
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </motion.div>
        
        {/* Logo secundario con animación */}
        <motion.div 
          className={styles.logoSecondaryContainer}
          variants={logoSecondaryVariants}
        >
          <motion.img 
            src={colors.logo.secondary}
            alt="Weave Brand" 
            className={styles.logoSecondary}
            whileHover={{ 
              scale: 1.03,
              filter: "drop-shadow(0 4px 8px rgba(22, 24, 39, 0.1))"
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>

      {/* Login/ForgotPassword Component con animación de entrada */}
      <motion.div
        className={styles.loginContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.9,
          delay: showForgotPassword ? 0.2 : 1.4,
          ease: [0.25, 0.25, 0.25, 0.75]
        }}
        key={showForgotPassword ? 'forgot' : 'login'}
      >
        {showForgotPassword ? (
          <ForgotPassword onBack={handleBackToLogin} />
        ) : (
          <Login 
            onSuccess={handleLoginSuccess} 
            onForgotPassword={handleForgotPassword}
          />
        )}
      </motion.div>
    </div>
    </AlertProvider>
  );
}