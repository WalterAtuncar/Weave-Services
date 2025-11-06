using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Domain.Entities
{
    public abstract class BaseEntity
    {  
        public int Version { get; set; } = 1;
        public int Estado { get; set; } = 1;
        public long? CreadoPor { get; set; }
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public long? ActualizadoPor { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public bool RegistroEliminado { get; set; } = false;
    }
}