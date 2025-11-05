FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore micro-service-weave.sln
RUN dotnet publish src/Gateway/Gateway.Api.csproj -c Release -o /app/publish
COPY src/Gateway/ocelot.json /app/publish/ocelot.json

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet","Gateway.Api.dll"]